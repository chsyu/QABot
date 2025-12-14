"""資料庫初始化模組"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SQLite 資料庫路徑
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "custom_service.db")

# 創建資料庫引擎
engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False}
)

# 創建 SessionLocal 類別
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 創建 Base 類別
Base = declarative_base()

def get_db():
    """獲取資料庫 session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """初始化資料庫表"""
    from backend.models import Document, ChatHistory
    Base.metadata.create_all(bind=engine)

