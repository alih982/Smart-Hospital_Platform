"""
ModelLog - ذخیره لاگ‌های عملکرد مدل در PostgreSQL
جایگزین حرفه‌ای فایل JSON برای Performance Tracker
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()

PGVECTOR_AVAILABLE = False

class ModelLog(Base):
    __tablename__ = "model_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_id = Column(String(255), nullable=True)
    model_name = Column(String(255), nullable=True)
    model_version = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    prompt_length = Column(Integer, nullable=True)
    response_length = Column(Integer, nullable=True)
    inference_time_s = Column(Float, nullable=True)
    tokens_generated = Column(Integer, nullable=True)
    input_tokens = Column(Integer, nullable=True)
    tokens_per_sec = Column(Float, nullable=True)
    perplexity = Column(Float, nullable=True)
    repetition_rate = Column(Float, nullable=True)
    quality_score = Column(Float, nullable=True)
    user_feedback = Column(String(50), nullable=True)
    feedback_timestamp = Column(DateTime, nullable=True)
    user_id = Column(String(255), nullable=True)
    conversation_id = Column(String(255), nullable=True)
    system_prompt = Column(Text, nullable=True)
    temperature = Column(Float, nullable=True)
    top_p = Column(Float, nullable=True)
    max_tokens = Column(Integer, nullable=True)
    n_ctx = Column(Integer, nullable=True)
    n_threads = Column(Integer, nullable=True)
    device = Column(String(50), nullable=True)
    metadata = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)

class FeedbackLog(Base):
    __tablename__ = "feedback_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_log_id = Column(Integer, ForeignKey("model_logs.id"), nullable=True)
    user_id = Column(String(255), nullable=True)
    feedback_type = Column(String(50), nullable=False)
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class DocumentEmbedding(Base):
    __tablename__ = "document_embeddings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

