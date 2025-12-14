"""SQLite 資料模型"""
from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.sql import func
from backend.database import Base
import uuid

class Document(Base):
    """文件資料模型"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    upload_time = Column(DateTime, server_default=func.now(), nullable=False)

class ChatHistory(Base):
    """聊天歷史資料模型"""
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    session_id = Column(Text, nullable=False, default=lambda: str(uuid.uuid4()))

