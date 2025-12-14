"""FastAPI 主應用"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import os

from backend.database import get_db, init_db
from backend.models import Document, ChatHistory
from backend.rag import process_and_store_document, query_rag, initialize_vectorstore

# 初始化 FastAPI 應用
app = FastAPI(title="客服聊天機器人 API")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化資料庫
init_db()

# 初始化向量庫
initialize_vectorstore()

# 全局變數存儲當前 session_id
current_session_id = str(uuid.uuid4())

# Pydantic 模型
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: str

class HistoryItem(BaseModel):
    id: int
    timestamp: str
    user_message: str
    bot_response: str
    session_id: str

class HistoryResponse(BaseModel):
    history: List[HistoryItem]

@app.get("/")
async def root():
    """根路徑"""
    return {"message": "客服聊天機器人 API", "status": "running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """上傳文件"""
    # 檢查文件格式
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="只支援 .txt 格式的文件")
    
    try:
        # 讀取文件內容
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # 清空舊文件（SQLite）
        db.query(Document).delete()
        db.commit()
        
        # 儲存新文件到 SQLite
        new_doc = Document(content=content_str)
        db.add(new_doc)
        db.commit()
        
        # 處理並儲存到向量庫
        process_and_store_document(content_str)
        
        return {
            "message": "文件上傳成功",
            "filename": file.filename,
            "size": len(content_str)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件上傳失敗：{str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage, db: Session = Depends(get_db)):
    """發送聊天訊息"""
    global current_session_id
    
    if not message.message or not message.message.strip():
        raise HTTPException(status_code=400, detail="訊息不能為空")
    
    try:
        # 使用 RAG 查詢回答
        bot_response = query_rag(message.message.strip())
        
        # 儲存對話歷史
        chat_record = ChatHistory(
            user_message=message.message.strip(),
            bot_response=bot_response,
            session_id=current_session_id
        )
        db.add(chat_record)
        db.commit()
        
        return ChatResponse(
            response=bot_response,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"處理訊息時發生錯誤：{str(e)}")

@app.get("/history", response_model=HistoryResponse)
async def get_history(db: Session = Depends(get_db)):
    """獲取聊天歷史"""
    try:
        history_records = db.query(ChatHistory).order_by(ChatHistory.timestamp.asc()).all()
        
        history_items = [
            HistoryItem(
                id=record.id,
                timestamp=record.timestamp.isoformat() if record.timestamp else "",
                user_message=record.user_message,
                bot_response=record.bot_response,
                session_id=record.session_id
            )
            for record in history_records
        ]
        
        return HistoryResponse(history=history_items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取歷史記錄時發生錯誤：{str(e)}")

@app.delete("/history")
async def clear_history(db: Session = Depends(get_db)):
    """清除聊天歷史"""
    try:
        db.query(ChatHistory).delete()
        db.commit()
        
        global current_session_id
        current_session_id = str(uuid.uuid4())
        
        return {"message": "聊天歷史已清除"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"清除歷史記錄時發生錯誤：{str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """全局異常處理"""
    return JSONResponse(
        status_code=500,
        content={"detail": f"伺服器錯誤：{str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

