"""Configuration for AI Service (FastAPI + llama-cpp-python + PostgreSQL)."""

from __future__ import annotations

from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # -------------------------
    # Service
    # -------------------------
    SERVICE_NAME: str = "Smart Health AI Service"
    DEBUG: bool = False

    # -------------------------
    # Model paths
    # -------------------------
    BASE_MODEL_PATH: str = ""
    MODEL_NAME: str = "Zhaav Gemma 3 4B (GGUF)"

    # -------------------------
    # Runtime / inference defaults
    # -------------------------
    TEMPERATURE: float = 0.7
    TOP_P: float = 0.9
    MAX_NEW_TOKENS: int = 256
    MAX_TOKENS: int = 256
    MAX_INPUT_TOKENS: int = 4096
    DO_SAMPLE: bool = True

    # -------------------------
    # llama-cpp settings
    # -------------------------
    N_CTX: int = 1024
    N_THREADS: int = 2
    N_GPU_LAYERS: int = 0

    # -------------------------
    # RAG (Retrieval-Augmented Generation)
    # پیش‌فرض: خاموش. برای فعال کردن = True
    # -------------------------
    ENABLE_RAG: bool = False

    # -------------------------
    # PostgreSQL Database Settings
    # اگر DB_URL خالی باشد، از فایل JSON محلی استفاده می‌شود
    # مثال: postgresql+asyncpg://user:pass@localhost:5432/ai_service
    # -------------------------
    DB_URL: str = ""  # خالی = استفاده از فایل JSON محلی
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False  # True = نمایش SQLها در لاگ

    # -------------------------
    # pgvector (Vector Store for RAG)
    # پیش‌فرض: خاموش. برای فعال کردن = True
    # نیاز به نصب pgvector روی PostgreSQL دارد
    # -------------------------
    ENABLE_PGVECTOR: bool = False
    VECTOR_DIMENSION: int = 768  # بعد بردارها (بستگی به مدل embedding دارد)

    # -------------------------
    # CORS
    # -------------------------
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://magicai.runflare.run",
        "http://maggicaihub.com:3000",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
