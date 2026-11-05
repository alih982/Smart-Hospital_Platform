"""
API endpoints for MLOps module
مدیریت چرخه مدل، بازگشت خودکار، جمع‌آوری داده برای فاین‌تیون
"""
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.mlops import (
    model_registry,
    performance_tracker,
    model_swapper,
    train_data_collector,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/mlops", tags=["MLOps"])


# ─── Request Models ────────────────────────────────────

class RecordInferenceRequest(BaseModel):
    model_id: str
    prompt_length: int
    response_length: int
    inference_time_s: float
    perplexity: Optional[float] = None
    repetition_rate: Optional[float] = None
    user_feedback: Optional[str] = None  # like | dislike | None


class RegisterModelRequest(BaseModel):
    name: str
    path: str
    model_type: str = "safetensors"
    format_version: str = "float32"


class EvaluateSwapRequest(BaseModel):
    new_model_name: str
    new_model_path: str
    format_version: str = "q4_k_m"
    min_quality_threshold: float = 0.3


# ─── Endpoints ─────────────────────────────────────────

@router.get("/registry")
async def list_registry():
    """لیست همه مدل‌های ثبت شده"""
    return {
        "success": True,
        "models": model_registry.list_all(),
        "count": model_registry.count(),
    }


@router.get("/registry/active")
async def get_active_model():
    """مدل فعال فعلی"""
    active = model_registry.get_active_model()
    if not active:
        return {"success": False, "message": "هیچ مدل فعالی وجود ندارد"}
    return {"success": True, "model": active.to_dict()}


@router.get("/registry/backups")
async def get_backup_models():
    """لیست مدل‌های پشتیبان"""
    backups = model_registry.get_backup_models()
    return {
        "success": True,
        "backups": [b.to_dict() for b in backups],
        "count": len(backups),
    }


@router.post("/registry/register")
async def register_model(req: RegisterModelRequest):
    """ثبت یک مدل جدید"""
    model_id = model_registry.register(
        name=req.name,
        path=req.path,
        model_type=req.model_type,
        format_version=req.format_version,
    )
    return {"success": True, "model_id": model_id, "message": f"مدل {req.name} ثبت شد"}


@router.post("/registry/activate/{model_id}")
async def activate_model(model_id: str):
    """فعال کردن یک مدل خاص"""
    success = model_registry.set_active(model_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"مدل {model_id} پیدا نشد")
    return {"success": True, "message": f"مدل {model_id} فعال شد"}


@router.get("/performance/stats/{model_id}")
async def get_model_stats(model_id: str, last_n: int = 100):
    """آمار عملکرد یک مدل"""
    stats = performance_tracker.get_model_stats(model_id, last_n)
    return {"success": True, "stats": stats}


@router.get("/performance/summary")
async def get_performance_summary(hours: int = 24):
    """خلاصه عملکرد در ساعات اخیر"""
    summary = performance_tracker.summarize_range(hours)
    return {"success": True, "summary": summary}


@router.post("/performance/record")
async def record_inference(req: RecordInferenceRequest):
    """ثبت یک بار inference"""
    performance_tracker.record_inference(
        model_id=req.model_id,
        prompt_length=req.prompt_length,
        response_length=req.response_length,
        inference_time_s=req.inference_time_s,
        perplexity=req.perplexity,
        repetition_rate=req.repetition_rate,
        user_feedback=req.user_feedback,
    )
    return {"success": True, "message": "ثبت شد"}


@router.get("/drift/{model_id}")
async def check_drift(model_id: str):
    """بررسی افت کیفیت مدل"""
    report = performance_tracker.get_recent_drift_report(model_id)
    return {"success": True, "report": report}


@router.post("/swap/evaluate")
async def evaluate_and_swap(req: EvaluateSwapRequest):
    """ارزیابی مدل جدید و تعویض در صورت بهتر بودن"""
    result = model_swapper.evaluate_and_swap(
        new_model_name=req.new_model_name,
        new_model_path=req.new_model_path,
        format_version=req.format_version,
        min_quality_threshold=req.min_quality_threshold,
    )
    return {"success": result["success"], "result": result}


@router.post("/swap/rollback")
async def rollback(backup_id: Optional[str] = None):
    """بازگشت به مدل پشتیبان"""
    result = model_swapper.rollback_to_backup(backup_id)
    return {"success": result["success"], "result": result}


@router.post("/swap/auto-rollback/{model_id}")
async def auto_rollback(model_id: str, drift_threshold: float = 0.1):
    """بازگشت خودکار در صورت افت کیفیت"""
    result = model_swapper.auto_rollback_if_drifted(model_id, drift_threshold)
    return {"success": result["success"], "result": result}


@router.get("/data/stats")
async def get_training_data_stats():
    """آمار داده‌های جمع‌آوری شده برای فاین‌تیون"""
    stats = train_data_collector.get_collection_stats()
    return {"success": True, "stats": stats}


@router.post("/data/record")
async def record_interaction(
    prompt: str,
    response: str,
    user_feedback: Optional[str] = None,
    quality_score: Optional[float] = None,
    model_id: Optional[str] = None,
):
    """ثبت یک تعامل برای جمع‌آوری داده"""
    train_data_collector.record_interaction(
        prompt=prompt,
        response=response,
        user_feedback=user_feedback,
        quality_score=quality_score,
        model_id=model_id,
    )
    return {"success": True, "message": "داده ثبت شد"}


@router.post("/data/generate-dataset")
async def generate_dataset(
    min_quality: float = 0.3,
    max_samples: int = 500,
    output_format: str = "alpaca",
):
    """تولید دیتاست آموزشی برای فاین‌تیون"""
    path = train_data_collector.generate_training_dataset(
        min_quality=min_quality,
        max_samples=max_samples,
        output_format=output_format,
    )
    return {"success": True, "dataset_path": path, "message": f"دیتاست در {path} ذخیره شد"}


@router.post("/prepare-16bit")
async def prepare_16bit_model():
    """آماده‌سازی مدل ۱۶-بیتی برای فاین‌تیون"""
    path = model_swapper.prepare_training_copy()
    if not path:
        raise HTTPException(status_code=500, detail="خطا در آماده‌سازی مدل ۱۶-بیتی")
    return {
        "success": True,
        "path": path,
        "message": "مدل ۱۶-بیتی برای فاین‌تیون آماده شد",
    }


@router.get("/compare/{model_a}/{model_b}")
async def compare_models(model_a: str, model_b: str, last_n: int = 100):
    """مقایسه دو مدل"""
    result = performance_tracker.compare_models(model_a, model_b, last_n)
    return {"success": True, "comparison": result}


@router.get("/health")
async def mlops_health():
    """وضعیت ماژول MLOps"""
    return {
        "success": True,
        "status": "healthy",
        "models_in_registry": model_registry.count(),
        "total_records": len(performance_tracker.history),
        "training_data_stats": train_data_collector.get_collection_stats(),
        "active_model": model_registry.get_active_model().to_dict() if model_registry.get_active_model() else None,
    }
