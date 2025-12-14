"""Ollama 客戶端封裝"""
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.chat_models import ChatOllama
from typing import List
import os

# 模型配置
EMBED_MODEL = "nomic-embed-text"
LLM_MODEL = "qwen2.5:7b-instruct"

# Ollama 基礎 URL（預設為 localhost:11434）
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# 初始化嵌入模型
embeddings = OllamaEmbeddings(
    model=EMBED_MODEL,
    base_url=OLLAMA_BASE_URL
)

# 初始化 LLM 模型
llm = ChatOllama(
    model=LLM_MODEL,
    temperature=0.7,
    base_url=OLLAMA_BASE_URL
)

def get_embeddings():
    """獲取嵌入模型實例"""
    return embeddings

def get_llm():
    """獲取 LLM 模型實例"""
    return llm

def embed_texts(texts: List[str]) -> List[List[float]]:
    """嵌入文本列表"""
    return embeddings.embed_documents(texts)

