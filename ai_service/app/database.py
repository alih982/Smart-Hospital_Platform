"""
Database Connection Module for AI Service
اتصال به PostgreSQL با SQLAlchemy async

این ماژول مدیریت می‌کند:
1. اتصال به PostgreSQL (در صورت تنظیم DB_URL)
2. ایجاد جداول خودکار
3. Session management
4. پشتیبانی اختیاری از pgvector
"""
import json
import logging
import os
from datetime import datetime
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from app.config import settings
from sqlalchemy.orm import declarative_base
Base = declarative_base()

# Lazy imports for model classes
ModelLog = None
FeedbackLog = None
PGVECTOR_AVAILABLE = False
DocumentEmbedding = None

def _init_models():
    global ModelLog, FeedbackLog, PGVECTOR_AVAILABLE, DocumentEmbedding
    try:
        from app.models.model_log import ModelLog as ML, FeedbackLog as FL
        ModelLog = ML
        FeedbackLog = FL
    except Exception as e:
        pass

logger = logging.getLogger(__name__)

# ── تنظیمات اتصال ──
USE_DATABASE = bool(settings.DB_URL)  # اگر DB_URL خالی باشد، دیتابیس غیرفعال است
engine = None
SessionLocal = None


def init_database():
    """
    مقداردهی اولیه دیتابیس
    
    اگر DB_URL تنظیم شده باشد:
    - اتصال به PostgreSQL برقرار می‌شود
    - جداول ایجاد می‌شوند
    - pgvector در صورت فعال بودن نصب می‌شود
    
    اگر DB_URL خالی باشد:
    - از فایل JSON محلی استفاده می‌شود (Performance Tracker فعلی)
    """
    global engine, SessionLocal, USE_DATABASE

    if not settings.DB_URL:
        logger.info("[DB] DB_URL خالی است → استفاده از فایل JSON محلی برای ذخیره لاگ‌ها")
        logger.info("[DB] برای فعال کردن PostgreSQL، DB_URL را در .env تنظیم کنید:")
        logger.info("[DB] DB_URL=postgresql+psycopg2://user:pass@localhost:5432/ai_service")
        USE_DATABASE = False
        return

    USE_DATABASE = True
    logger.info("[DB] 🚀 اتصال به PostgreSQL...")
    logger.info("[DB] URL: %s", settings.DB_URL.replace(settings.DB_URL.split("@")[1] if "@" in settings.DB_URL else "", "***@***"))

    try:
        engine = create_engine(
            settings.DB_URL,
            pool_size=settings.DB_POOL_SIZE,
            max_overflow=settings.DB_MAX_OVERFLOW,
            poolclass=QueuePool,
            pool_pre_ping=True,  # بررسی سلامت اتصال قبل از استفاده
            echo=settings.DB_ECHO,
        )

        # تست اتصال
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            pg_version = result.scalar()
            logger.info("[DB] ✅ اتصال برقرار شد | PostgreSQL: %s", pg_version)

        # ── نصب pgvector (اختیاری) ──
        if settings.ENABLE_PGVECTOR:
            if PGVECTOR_AVAILABLE:
                logger.info("[DB] 🔧 نصب pgvector...")
                with engine.connect() as conn:
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                    conn.commit()
                logger.info("[DB] ✅ pgvector فعال شد")
            else:
                logger.warning("[DB] ⚠️ pgvector درخواست شده ولی نصب نیست")
                logger.warning("[DB] برای نصب: pip install pgvector")
                logger.warning("[DB] و سپس DROP TABLE IF EXISTS document_embeddings;")

        # ── ایجاد جداول ──
        logger.info("[DB] 📦 ایجاد جداول...")
        Base.metadata.create_all(engine)
        logger.info("[DB] ✅ جداول ایجاد شدند")

        # ── Session Local ──
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info("[DB] ✅ دیتابیس آماده است")

    except Exception as e:
        logger.error("[DB] ❌ خطا در اتصال به دیتابیس: %s", e)
        logger.error("[DB] سوییچ به فایل JSON محلی...")
        USE_DATABASE = False
        engine = None
        SessionLocal = None


def get_db() -> Optional[Session]:
    """
    دریافت یک session دیتابیس
    
    Returns:
        Session: SQLAlchemy session یا None اگر دیتابیس فعال نیست
    """
    if not USE_DATABASE or SessionLocal is None:
        return None
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        logger.error("[DB] خطا در ایجاد session: %s", e)
        return None


def close_db(db: Optional[Session]):
    """بستن session دیتابیس"""
    if db:
        try:
            db.close()
        except Exception:
            pass


@asynccontextmanager
async def get_db_async():
    """
    Context manager async برای دریافت session
    
    استفاده:
    async with get_db_async() as db:
        if db:
            # کار با دیتابیس
    """
    db = get_db()
    try:
        yield db
    finally:
        close_db(db)


# ── توابع ذخیره‌سازی لاگ‌ها ──

def save_model_log(
    model_id: str,
    prompt: str,
    response: str,
    inference_time_s: float,
    tokens_generated: int,
    prompt_length: int = None,
    response_length: int = None,
    input_tokens: int = None,
    perplexity: float = None,
    repetition_rate: float = None,
    quality_score: float = None,
    user_feedback: str = None,
    user_id: str = None,
    conversation_id: str = None,
    system_prompt: str = None,
    temperature: float = None,
    top_p: float = None,
    max_tokens: int = None,
    n_ctx: int = None,
    n_threads: int = None,
    device: str = None,
    model_name: str = None,
    model_version: str = None,
    metadata: dict = None,
    error: str = None,
) -> Optional[int]:
    """
    ذخیره یک لاگ مدل در دیتابیس
    
    اگر دیتابیس فعال نباشد، در فایل JSON ذخیره می‌کند
    Returns:
        id لاگ ذخیره شده یا None
    """
    if USE_DATABASE and SessionLocal:
        db = get_db()
        if db:
            try:
                log_entry = ModelLog(
                    timestamp=datetime.utcnow(),
                    model_id=model_id,
                    model_name=model_name,
                    model_version=model_version,
                    prompt=prompt,
                    response=response,
                    prompt_length=prompt_length or (len(prompt) if prompt else 0),
                    response_length=response_length or (len(response) if response else 0),
                    inference_time_s=inference_time_s,
                    tokens_generated=tokens_generated,
                    input_tokens=input_tokens,
                    tokens_per_sec=round(tokens_generated / inference_time_s, 2) if inference_time_s > 0 else 0,
                    perplexity=perplexity,
                    repetition_rate=repetition_rate,
                    quality_score=quality_score,
                    user_feedback=user_feedback or "none",
                    user_id=user_id,
                    conversation_id=conversation_id,
                    system_prompt=system_prompt,
                    temperature=temperature,
                    top_p=top_p,
                    max_tokens=max_tokens,
                    n_ctx=n_ctx,
                    n_threads=n_threads,
                    device=device or "cpu",
                    metadata=metadata or {},
                    error=error,
                )
                db.add(log_entry)
                db.commit()
                db.refresh(log_entry)
                logger.debug("[DB] ✅ لاگ مدل ذخیره شد | id=%s | model=%s | time=%.2fs",
                             log_entry.id, model_id, inference_time_s)
                return log_entry.id
            except Exception as e:
                db.rollback()
                logger.error("[DB] ❌ خطا در ذخیره لاگ: %s", e)
            finally:
                close_db(db)

    # Fallback: ذخیره در فایل Performance Tracker
    from app.mlops.performance_tracker import performance_tracker
    performance_tracker.record_inference(
        model_id=model_id,
        prompt_length=prompt_length or (len(prompt) if prompt else 0),
        response_length=response_length or (len(response) if response else 0),
        inference_time_s=inference_time_s,
        perplexity=perplexity,
        repetition_rate=repetition_rate,
        user_feedback=user_feedback,
    )
    return None


def update_feedback(model_log_id: int, user_id: str, feedback: str, comment: str = None):
    """
    به‌روزرسانی بازخورد کاربر روی یک لاگ
    
    Args:
        model_log_id: id لاگ مدل
        user_id: شناسه کاربر
        feedback: like یا dislike
        comment: نظر کاربر (اختیاری)
    """
    if not USE_DATABASE or not SessionLocal:
        return None

    db = get_db()
    if not db:
        return None

    try:
        # به‌روزرسانی ModelLog
        log_entry = db.query(ModelLog).filter(ModelLog.id == model_log_id).first()
        if log_entry:
            log_entry.user_feedback = feedback
            log_entry.feedback_timestamp = datetime.utcnow()
            log_entry.user_id = user_id

        # ثبت FeedbackLog
        feedback_log = FeedbackLog(
            model_log_id=model_log_id,
            user_id=user_id,
            feedback_type=feedback,
            comment=comment,
        )
        db.add(feedback_log)
        db.commit()
        logger.info("[DB] ✅ بازخورد ثبت شد | log_id=%s | feedback=%s", model_log_id, feedback)
        return True

    except Exception as e:
        db.rollback()
        logger.error("[DB] ❌ خطا در ثبت بازخورد: %s", e)
        return None
    finally:
        close_db(db)


# ── توابع گزارش‌گیری ──

def get_stats(hours: int = 168) -> Dict:
    """
    آمار کلی از دیتابیس (جایگزین performance_tracker.summarize_range)
    """
    if not USE_DATABASE or not SessionLocal:
        # Fallback به فایل JSON
        from app.mlops.performance_tracker import performance_tracker
        return performance_tracker.summarize_range(hours)

    db = get_db()
    if not db:
        return {"total": 0}

    try:
        from datetime import timedelta
        cutoff = datetime.utcnow() - timedelta(hours=hours)

        total = db.query(ModelLog).filter(ModelLog.timestamp >= cutoff).count()
        likes = db.query(ModelLog).filter(
            ModelLog.timestamp >= cutoff,
            ModelLog.user_feedback == "like"
        ).count()
        dislikes = db.query(ModelLog).filter(
            ModelLog.timestamp >= cutoff,
            ModelLog.user_feedback == "dislike"
        ).count()

        # میانگین‌ها
        avg_quality = db.query(
            db.query(ModelLog.quality_score)
            .filter(ModelLog.timestamp >= cutoff, ModelLog.quality_score.isnot(None))
            .statement
        ).scalar()

        avg_tps = db.query(
            db.query(ModelLog.tokens_per_sec)
            .filter(ModelLog.timestamp >= cutoff, ModelLog.tokens_per_sec.isnot(None))
            .statement
        ).scalar()

        return {
            "total": total,
            "avg_quality_score": round(float(avg_quality), 4) if avg_quality else None,
            "avg_tokens_per_sec": round(float(avg_tps), 2) if avg_tps else None,
            "total_likes": likes,
            "total_dislikes": dislikes,
            "like_ratio": round(likes / (likes + dislikes), 3) if (likes + dislikes) > 0 else None,
        }
    except Exception as e:
        logger.error("[DB] خطا در آمارگیری: %s", e)
        return {"total": 0}
    finally:
        close_db(db)
