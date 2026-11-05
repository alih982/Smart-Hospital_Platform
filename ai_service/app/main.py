#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI Service - FastAPI + Auto-Detect Model Format
GGUF → llama-cpp-python (CPU-optimized, light)
Safetensors → transformers + torch (fallback, heavier)
"""
from __future__ import annotations

import asyncio
import logging
import math
import os
import sys
import traceback
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from typing import Any, Optional

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.config import settings

# ========== Database (optional PostgreSQL or local JSON) ==========
from app.database import init_database, save_model_log, USE_DATABASE

logger = logging.getLogger(__name__)

inference_executor = ThreadPoolExecutor(max_workers=1)


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s",
    )


def _detect_device() -> str:
    logger.debug("[DEVICE] CPU mode (llama-cpp-python or transformers)")
    return "cpu"


def _check_dependencies_warning_only() -> list[str]:
    required = {
        "fastapi": "fastapi",
        "uvicorn": "uvicorn",
        "pydantic": "pydantic",
    }
    logger.info("[DEPS] Checking required dependencies...")
    missing: list[str] = []
    for import_name, pip_name in required.items():
        try:
            mod = __import__(import_name)
            version = getattr(mod, "__version__", "unknown")
            logger.debug("[DEPS] ✓ %s (version=%s)", pip_name, version)
        except Exception as e:
            logger.warning("[DEPS] ✗ MISSING: %s | import_name=%s | error=%s", pip_name, import_name, e)
            missing.append(pip_name)
    if missing:
        logger.error("[DEPS] Missing packages: %s", ", ".join(sorted(set(missing))))
    else:
        logger.info("[DEPS] All dependencies present ✓")
    return sorted(set(missing))


# ─── Detect model format ──────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# MODEL_DIR = os.path.join(BASE_DIR, "ai_model")
MODEL_DIR = os.path.join(BASE_DIR, "ai_model", "current")

# Scan MODEL_DIR for model files
MODEL_FILE_GGUF = None
MODEL_FILE_SAFETENSORS = None

if os.path.isdir(MODEL_DIR):
    for f in os.listdir(MODEL_DIR):
        if f.endswith(".gguf"):
            MODEL_FILE_GGUF = os.path.join(MODEL_DIR, f)
        elif f.endswith(".safetensors"):
            MODEL_FILE_SAFETENSORS = os.path.join(MODEL_DIR, f)

USE_LLAMA_CPP = False
USE_TRANSFORMERS = False
MODEL_BACKEND = "none"

# Priority: GGUF first (lighter, faster on CPU)
if MODEL_FILE_GGUF and os.path.isfile(MODEL_FILE_GGUF):
    try:
        from llama_cpp import Llama
        USE_LLAMA_CPP = True
        MODEL_BACKEND = "llama-cpp (GGUF)"
        logger.info("[MODEL] ✅ GGUF model found: %s (will use llama-cpp-python)", MODEL_FILE_GGUF)
    except ImportError:
        logger.warning("[MODEL] GGUF model found but llama-cpp-python not installed")
        MODEL_BACKEND = "llama-cpp (missing)"
# Fallback: safetensors
elif MODEL_FILE_SAFETENSORS and os.path.isfile(MODEL_FILE_SAFETENSORS):
    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer
        import torch
        USE_TRANSFORMERS = True
        MODEL_BACKEND = "transformers (safetensors)"
        logger.info("[MODEL] ✅ Safetensors model found: %s (will use transformers)", MODEL_FILE_SAFETENSORS)
    except ImportError:
        logger.warning("[MODEL] Safetensors model found but transformers/torch not installed")
        MODEL_BACKEND = "transformers (missing)"
else:
    logger.warning("[MODEL] ⚠️ No model file found in %s", MODEL_DIR)
    logger.warning("[MODEL] Expected: *.gguf or *.safetensors")

model_name = settings.MODEL_NAME or "Zhaav Gemma 3 4B"
model = None
model_loaded: bool = False
load_error: Optional[str] = None
load_stage: Optional[str] = None
missing_dependencies: list[str] = []
DEVICE = _detect_device()
tokenizer = None  # only used in transformers mode


def _log_model_file_state() -> None:
    if USE_LLAMA_CPP and MODEL_FILE_GGUF:
        path = MODEL_FILE_GGUF
        label = "GGUF"
    elif USE_TRANSFORMERS and MODEL_FILE_SAFETENSORS:
        path = MODEL_FILE_SAFETENSORS
        label = "SAFETENSORS"
    else:
        logger.warning("[FILES] No model file to inspect")
        return

    try:
        logger.info("[FILES] === %s MODEL === path=%s", label, path)
        if not os.path.exists(path):
            logger.error("[FILES] ✗ FILE DOES NOT EXIST: %s", path)
            return
        size_bytes = os.path.getsize(path)
        size_mb = size_bytes / (1024 * 1024)
        readable = os.access(path, os.R_OK)
        logger.info("[FILES] ✓ %s | size=%.2f MB (%d bytes) | readable=%s",
                    os.path.basename(path), size_mb, size_bytes, readable)
        if size_bytes == 0:
            logger.error("[FILES] ✗ ZERO-BYTE FILE (corrupt): %s", path)
        elif size_mb < 10:
            logger.warning("[FILES] ⚠ Suspiciously small file: %.2f MB", size_mb)
    except Exception as e:
        logger.warning("[FILES] Failed to log model file state | error=%s", e, exc_info=True)


def load_model(force_reload: bool = False) -> None:
    global model, model_loaded, load_error, load_stage, tokenizer

    if model_loaded and model is not None and not force_reload:
        logger.info("[LOAD] Model already loaded, skipping (use force_reload=True to reload).")
        return

    load_error = None
    load_stage = None

    logger.info("=" * 70)
    logger.info("[LOAD] ▶ Starting model load sequence (force_reload=%s)", force_reload)
    logger.info("[LOAD] Backend: %s", MODEL_BACKEND)
    logger.info("[LOAD] Device: CPU")
    logger.info("[LOAD] Python: %s", sys.version)
    logger.info("=" * 70)

    try:
        load_stage = "file_check"
        logger.info("[LOAD][%s] Inspecting model file...", load_stage)
        _log_model_file_state()

        if USE_LLAMA_CPP and MODEL_FILE_GGUF:
            # ── GGUF → llama-cpp-python ──
            load_stage = "model_load_llamacpp"
            logger.info("[LOAD][%s] Loading GGUF with llama-cpp-python...", load_stage)
            logger.info("[LOAD][%s] n_ctx=%s, n_threads=%s, n_gpu_layers=0 (CPU)",
                        load_stage, settings.N_CTX, settings.N_THREADS)

            from llama_cpp import Llama
            llm = Llama(
                model_path=MODEL_FILE_GGUF,
                n_ctx=settings.N_CTX,
                n_threads=settings.N_THREADS,
                n_gpu_layers=0,
                verbose=False,
                seed=-1,
            )
            model = llm
            model_loaded = True
            logger.info("[LOAD][%s] ✓ GGUF model loaded successfully", load_stage)

        elif USE_TRANSFORMERS and MODEL_FILE_SAFETENSORS:
            # ── Safetensors → transformers + torch ──
            load_stage = "model_load_transformers"
            logger.info("[LOAD][%s] Loading safetensors with transformers...", load_stage)
            logger.info("[LOAD][%s] torch_dtype=float32, device=cpu", load_stage)

            from transformers import AutoModelForCausalLM, AutoTokenizer
            import torch

            tokenizer = AutoTokenizer.from_pretrained(
                MODEL_DIR,
                trust_remote_code=False,
                local_files_only=True,
            )
            if tokenizer.pad_token is None:
                tokenizer.pad_token = tokenizer.eos_token

            llm = AutoModelForCausalLM.from_pretrained(
                MODEL_DIR,
                trust_remote_code=False,
                local_files_only=True,
                torch_dtype=torch.float32,
            )
            llm = llm.to("cpu")
            llm.eval()
            model = llm
            model_loaded = True
            logger.info("[LOAD][%s] ✓ Safetensors model loaded successfully", load_stage)

        else:
            raise RuntimeError(f"No usable model backend. MODEL_BACKEND={MODEL_BACKEND}")

        logger.info("=" * 70)
        logger.info("[LOAD] ✓ MODEL LOAD COMPLETE")
        logger.info("[LOAD] Backend: %s", MODEL_BACKEND)
        logger.info("=" * 70)

    except Exception as e:
        model_loaded = False
        model = None
        tokenizer = None
        load_error = f"{type(e).__name__}: {e}"
        logger.error("=" * 70)
        logger.error("[LOAD] ✗ MODEL LOAD FAILED")
        logger.error("[LOAD] Stage: %s", load_stage)
        logger.error("[LOAD] Error: %s", load_error)
        logger.error("[LOAD] Backend: %s", MODEL_BACKEND)
        logger.error("[LOAD] Traceback:\n%s", traceback.format_exc())
        logger.error("=" * 70)


# ─── FastAPI App ─────────────────────────────────────────────────
app = FastAPI(
    title=settings.SERVICE_NAME,
    description="AI Service - Auto-detect GGUF or Safetensors + MLOps + PowerBI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──
from app.api.v1.mlops import router as mlops_router
from app.api.v1.powerbi import router as powerbi_router
app.include_router(mlops_router)
app.include_router(powerbi_router)


# ── Pydantic models ──
class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None
    system_prompt: str | None = None
    history: list[dict[str, Any]] | None = None


class ChatResponse(BaseModel):
    success: bool
    message: str
    response: str | None = None
    conversation_id: str | None = None
    model_loaded: bool = False
    load_error: str | None = None
    error_stage: str | None = None
    inference_time: float | None = None
    tokens_generated: int | None = None
    perplexity: float | None = None
    repetition_rate: float | None = None
    log_id: int | None = None


class FeedbackRequest(BaseModel):
    log_id: int
    feedback: str
    user_id: str | None = None
    comment: str | None = None


# ─── Startup ─────────────────────────────────────────────────────
@app.on_event("startup")
def _startup_event() -> None:
    global missing_dependencies
    try:
        _configure_logging()
        logger.info("[STARTUP] 🔧 Initializing database...")
        init_database()
        if USE_DATABASE:
            logger.info("[STARTUP] ✅ PostgreSQL is ACTIVE")
        else:
            logger.info("[STARTUP] 📁 Local JSON logs (set DB_URL for PostgreSQL)")

        missing_dependencies = _check_dependencies_warning_only()
        logger.info("[STARTUP] ✅ AI service ready | backend=%s | model_loaded=%s",
                    MODEL_BACKEND, model_loaded)
    except Exception:
        logger.exception("[STARTUP] startup event failed")


# ─── Endpoints ───────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "service": settings.SERVICE_NAME,
        "status": "running",
        "docs": "/docs",
        "model_backend": MODEL_BACKEND,
        "model_loaded": model_loaded,
        "database": "active" if USE_DATABASE else "local-json",
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "missing_dependencies": missing_dependencies,
        "device": DEVICE,
        "model_name": model_name,
        "model_backend": MODEL_BACKEND,
        "load_stage": load_stage,
        "load_error": load_error,
        "database": {
            "status": "active" if USE_DATABASE else "local-json",
            "type": "PostgreSQL" if USE_DATABASE else "JSON File",
        },
    }


@app.post("/reload")
async def reload_model():
    """بارگذاری مجدد مدل از مسیر current (بدون ری‌استارت سرویس)"""
    try:
        load_model(force_reload=True)
        if model_loaded:
            return {"status": "model reloaded successfully", "backend": MODEL_BACKEND}
        else:
            return {"status": "model reload failed", "error": load_error}, 500
    except Exception as e:
        logger.error("[RELOAD] Error: %s", e, exc_info=True)
        return {"status": "error", "detail": str(e)}, 500

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    global load_error, load_stage

    logger.info("[CHAT] Incoming | conv=%s | msg_len=%d",
                request.conversation_id, len(request.message))

    # Lazy load
    if model is None or not model_loaded:
        logger.warning("[CHAT] Model not loaded — lazy loading...")
        try:
            load_model()
        except Exception:
            logger.error("[CHAT] Lazy load failed", exc_info=True)

    if model is None or not model_loaded:
        logger.error("[CHAT] ✗ Model unavailable | load_error=%s", load_error)
        return ChatResponse(
            success=False,
            message="AI model is not loaded.",
            response="AI model is not loaded.",
            conversation_id=request.conversation_id,
            model_loaded=False,
            load_error=load_error,
            error_stage=load_stage or "model_not_loaded",
        )

    # Build messages
    messages = []
    if request.system_prompt:
        messages.append({"role": "system", "content": request.system_prompt})
    else:
        messages.append({"role": "system", "content": "شما یک دستیار مفید و دقیق هستید."})
    if request.history:
        for h in request.history[-6:]:
            role = h.get("role", "user")
            if role in ("user", "assistant", "system"):
                messages.append({"role": role, "content": h.get("content", "")})
    messages.append({"role": "user", "content": request.message})

    log_id = None
    gen_start = datetime.now()

    try:
        load_stage = "generation"

        if USE_LLAMA_CPP:
            # ── llama-cpp-python ──
            logger.info("[CHAT] Using llama-cpp | max_tokens=%s | temp=%s",
                        settings.MAX_NEW_TOKENS, settings.TEMPERATURE)

            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                inference_executor,
                lambda: model.create_chat_completion(
                    messages=messages,
                    max_tokens=settings.MAX_NEW_TOKENS,
                    temperature=float(settings.TEMPERATURE),
                    top_p=float(settings.TOP_P),
                    repeat_penalty=1.1,
                )
            )

            reply = response["choices"][0]["message"]["content"].strip()
            output_token_count = response.get("usage", {}).get("completion_tokens", 0)

            # Perplexity
            perplexity_val = None
            logprobs = response.get("choices", [{}])[0].get("logprobs")
            if logprobs and logprobs.get("token_logprobs"):
                tlp = [lp for lp in logprobs["token_logprobs"] if lp is not None]
                if tlp:
                    perplexity_val = float(math.exp(-sum(tlp) / len(tlp)))

        elif USE_TRANSFORMERS:
            # ── transformers + torch ──
            logger.info("[CHAT] Using transformers | max_new_tokens=%s | temp=%s",
                        settings.MAX_NEW_TOKENS, settings.TEMPERATURE)

            prompt = tokenizer.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )

            inputs = tokenizer(prompt, return_tensors="pt", truncation=True,
                               max_length=settings.N_CTX)
            inputs = {k: v.to("cpu") for k, v in inputs.items()}

            loop = asyncio.get_running_loop()
            output_ids = await loop.run_in_executor(
                inference_executor,
                lambda: model.generate(
                    **inputs,
                    max_new_tokens=settings.MAX_NEW_TOKENS,
                    temperature=float(settings.TEMPERATURE),
                    top_p=float(settings.TOP_P),
                    do_sample=bool(settings.DO_SAMPLE),
                    pad_token_id=tokenizer.eos_token_id,
                )
            )

            input_len = inputs["input_ids"].shape[1]
            output_token_count = output_ids.shape[1] - input_len
            reply = tokenizer.decode(output_ids[0][input_len:], skip_special_tokens=True).strip()

            # Perplexity from loss
            perplexity_val = None
            try:
                with torch.no_grad():
                    outputs = model(**inputs, labels=inputs["input_ids"])
                    loss = outputs.loss
                    perplexity_val = float(math.exp(loss.item()))
            except Exception:
                pass

        else:
            raise RuntimeError(f"No inference backend: {MODEL_BACKEND}")

        gen_elapsed = (datetime.now() - gen_start).total_seconds()

        # Repetition rate
        repetition_rate_val = None
        if reply:
            words = reply.split()
            if len(words) > 1:
                repetition_rate_val = round(1.0 - (len(set(words)) / len(words)), 4)

        # Quality score
        quality_score = None
        if gen_elapsed > 0 and reply:
            tps = output_token_count / gen_elapsed
            quality_score = round(
                min(1.0, 0.4 + tps * 0.05 +
                    (0.2 if perplexity_val and perplexity_val < 50 else 0) -
                    (0.2 if repetition_rate_val and repetition_rate_val > 0.3 else 0)),
                4
            )

        logger.info("[CHAT] ✓ Done | tokens=%d | %.2fs | ppl=%s | rep=%s | quality=%s",
                    output_token_count, gen_elapsed,
                    f"{perplexity_val:.2f}" if perplexity_val else "N/A",
                    repetition_rate_val, quality_score)

        # Save log
        try:
            log_id = save_model_log(
                model_id="zhaav-gemma3-4b",
                model_name=model_name,
                model_version=MODEL_BACKEND,
                prompt=request.message,
                response=reply,
                inference_time_s=gen_elapsed,
                tokens_generated=output_token_count,
                input_tokens=len(request.message),
                prompt_length=len(request.message),
                response_length=len(reply),
                perplexity=perplexity_val,
                repetition_rate=repetition_rate_val,
                quality_score=quality_score,
                user_id=request.conversation_id or "anonymous",
                conversation_id=request.conversation_id,
                system_prompt=request.system_prompt,
                temperature=settings.TEMPERATURE,
                top_p=settings.TOP_P,
                max_tokens=settings.MAX_NEW_TOKENS,
                n_ctx=settings.N_CTX,
                n_threads=settings.N_THREADS,
                device="cpu",
            )
        except Exception as db_err:
            logger.warning("[DB] ⚠ %s", db_err)

        return ChatResponse(
            success=True,
            message=reply,
            response=reply,
            conversation_id=request.conversation_id or f"conv-{datetime.now().timestamp()}",
            model_loaded=True,
            inference_time=round(gen_elapsed, 2),
            tokens_generated=output_token_count,
            perplexity=round(perplexity_val, 4) if perplexity_val else None,
            repetition_rate=repetition_rate_val,
            log_id=log_id,
        )

    except Exception as e:
        err = f"{type(e).__name__}: {e}"
        logger.error("[CHAT] ✗ FAILED | %s", err)
        logger.error(traceback.format_exc())
        try:
            save_model_log(
                model_id="zhaav-gemma3-4b",
                model_name=model_name,
                prompt=request.message,
                response="",
                inference_time_s=0,
                tokens_generated=0,
                error=err,
                conversation_id=request.conversation_id,
            )
        except Exception:
            pass
        return ChatResponse(
            success=False,
            message=f"Error: {err}",
            response=f"Error: {err}",
            conversation_id=request.conversation_id,
            model_loaded=model_loaded,
            load_error=load_error,
            error_stage=load_stage or "unknown",
        )


@app.post("/api/v1/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    async def generate():
        conv_id = request.conversation_id or f"conv-{datetime.now().timestamp()}"
        result = await chat_endpoint(request)
        if not result.success:
            yield f"data: {json.dumps({'error': result.message, 'done': True})}\n\n"
            return
        yield f"data: {json.dumps({'chunk': result.message, 'conversation_id': conv_id, 'done': False, 'log_id': result.log_id}, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'conversation_id': conv_id, 'done': True, 'log_id': result.log_id}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@app.post("/api/v1/feedback")
async def submit_feedback(request: FeedbackRequest):
    if request.feedback not in ("like", "dislike"):
        return {"success": False, "error": "feedback must be 'like' or 'dislike'"}
    try:
        from app.database import update_feedback
        update_feedback(
            model_log_id=request.log_id,
            user_id=request.user_id or "anonymous",
            feedback=request.feedback,
            comment=request.comment,
        )
        return {"success": True, "feedback": request.feedback, "log_id": request.log_id}
    except Exception as e:
        logger.error("[FEEDBACK] Error: %s", e)
        return {"success": False, "error": str(e)}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error("[GLOBAL_EXC] %s | %s", getattr(request, "url", None), exc, exc_info=True)
    return {
        "success": False,
        "message": "System error occurred",
        "model_loaded": model_loaded,
        "load_error": load_error,
        "error_stage": "unhandled_exception",
    }


if __name__ == "__main__":
    _configure_logging()
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "5000")), reload=False, log_level="debug")
