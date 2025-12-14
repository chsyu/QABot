"""RAG 邏輯模組"""
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from backend.ollama_client import get_embeddings, get_llm
import os
import shutil

# Chroma 持久化路徑
CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
COLLECTION_NAME = "customer_service_docs"

# 文本分割器
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    length_function=len,
)

# 全局變數存儲向量庫
vectorstore = None

def initialize_vectorstore():
    """初始化或載入向量庫"""
    global vectorstore
    embeddings = get_embeddings()
    
    if os.path.exists(CHROMA_PERSIST_DIR):
        # 載入現有向量庫
        vectorstore = Chroma(
            persist_directory=CHROMA_PERSIST_DIR,
            embedding_function=embeddings,
            collection_name=COLLECTION_NAME
        )
    else:
        # 創建新的向量庫（空）
        vectorstore = Chroma(
            persist_directory=CHROMA_PERSIST_DIR,
            embedding_function=embeddings,
            collection_name=COLLECTION_NAME
        )
    
    return vectorstore

def clear_vectorstore():
    """清空向量庫"""
    global vectorstore
    
    # 如果目錄存在，刪除整個目錄
    import shutil
    if os.path.exists(CHROMA_PERSIST_DIR):
        try:
            shutil.rmtree(CHROMA_PERSIST_DIR)
        except Exception as e:
            print(f"清除向量庫時發生錯誤：{e}")
    
    # 重新初始化
    embeddings = get_embeddings()
    vectorstore = Chroma(
        persist_directory=CHROMA_PERSIST_DIR,
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME
    )

def process_and_store_document(content: str):
    """處理並儲存文件到向量庫"""
    global vectorstore
    
    # 清空舊內容
    clear_vectorstore()
    
    # 分割文本
    texts = text_splitter.split_text(content)
    
    # 如果沒有文本，返回
    if not texts:
        return
    
    # 添加到向量庫
    embeddings = get_embeddings()
    vectorstore = Chroma.from_texts(
        texts=texts,
        embedding=embeddings,
        persist_directory=CHROMA_PERSIST_DIR,
        collection_name=COLLECTION_NAME
    )

def get_rag_chain():
    """獲取 RAG 鏈"""
    global vectorstore
    
    if vectorstore is None:
        initialize_vectorstore()
    
    # 檢查向量庫是否為空
    try:
        # 嘗試獲取一個樣本來檢查是否有數據
        results = vectorstore.similarity_search("test", k=1)
        if not results or len(results) == 0:
            return None
    except Exception as e:
        # 如果出錯，可能表示向量庫為空或未初始化
        return None
    
    # 創建 Prompt 模板
    prompt_template = """你是一個友善的客服助手。請根據以下提供的上下文資訊回答用戶的問題。
如果你不知道答案，請誠實地說你不知道，不要編造資訊。

上下文資訊：
{context}

問題：{question}

請用繁體中文回答："""
    
    PROMPT = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )
    
    # 創建 RAG 鏈
    qa_chain = RetrievalQA.from_chain_type(
        llm=get_llm(),
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        chain_type_kwargs={"prompt": PROMPT},
        return_source_documents=False,
    )
    
    return qa_chain

def query_rag(question: str) -> str:
    """使用 RAG 查詢"""
    qa_chain = get_rag_chain()
    
    if qa_chain is None:
        return "抱歉，目前還沒有上傳任何客服資料文件。請先上傳 .txt 格式的文件。"
    
    try:
        result = qa_chain.invoke({"query": question})
        return result.get("result", "抱歉，我無法生成回答。")
    except Exception as e:
        return f"處理問題時發生錯誤：{str(e)}"

