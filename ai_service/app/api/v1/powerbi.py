"""
Power BI Export API - خروجی داده حرفه‌ای برای داشبورد Power BI
شامل تمام ابعاد تحلیلی: عملکرد مدل، بازخورد، روندها، drift، مقایسه
"""
import json
import logging
import csv
import io
import math
from datetime import datetime, timedelta, date
from typing import Optional, List, Dict
from collections import defaultdict
from statistics import mean, median, stdev

from fastapi import APIRouter, Query, Response
from pydantic import BaseModel

from app.mlops import (
    model_registry,
    performance_tracker,
    train_data_collector,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/powerbi", tags=["Power BI"])


# ====================================================================
# ۱. KPI‌های اصلی و خلاصه داشبورد
# ====================================================================
@router.get("/dashboard-summary")
async def dashboard_summary(hours: int = 168):
    """
    📊 **خلاصه کامل داشبورد عملکرد مدل**
    
    شامل:
    - KPIهای اصلی (تعداد درخواست، کیفیت، سرعت، بازخورد)
    - اطلاعات مدل فعال
    - تحلیل Drift
    - آمار داده‌های آموزشی
    - روند روزانه
    """
    summary = performance_tracker.summarize_range(hours)
    models = model_registry.list_all()
    active = model_registry.get_active_model()

    drift_report = None
    if active:
        drift_report = performance_tracker.get_recent_drift_report(active.model_id)

    # روند روزانه (برای ۷ روز)
    daily_trend = []
    for day_offset in range(7):
        day_start = (datetime.now() - timedelta(days=day_offset + 1)).isoformat()
        day_end = (datetime.now() - timedelta(days=day_offset)).isoformat()
        day_records = [
            r for r in performance_tracker.history
            if day_start <= r["timestamp"] < day_end
        ]
        if day_records:
            scores = [r["quality_score"] for r in day_records if r["quality_score"]]
            tps_list = [r["tokens_per_sec"] for r in day_records if r["tokens_per_sec"]]
            likes = sum(1 for r in day_records if r["user_feedback"] == "like")
            dislikes = sum(1 for r in day_records if r["user_feedback"] == "dislike")
            daily_trend.append({
                "date": day_start[:10],
                "requests": len(day_records),
                "avg_quality": round(mean(scores), 4) if scores else None,
                "avg_tps": round(mean(tps_list), 2) if tps_list else None,
                "likes": likes,
                "dislikes": dislikes,
            })

    return {
        "success": True,
        "dashboard": {
            "generated_at": datetime.now().isoformat(),
            "report_title": "گزارش جامع عملکرد مدل هوش مصنوعی",
            "time_range_hours": hours,
            "time_range_label": f"{hours//24} روز اخیر" if hours >= 24 else f"{hours} ساعت اخیر",

            # ── KPIهای اصلی ──
            "kpis": {
                "total_requests_last_period": summary.get("total", 0),
                "avg_quality_score": summary.get("avg_quality_score"),
                "quality_trend": "🟢 خوب" if (summary.get("avg_quality_score") or 0) > 0.6 else "🟡 متوسط" if (summary.get("avg_quality_score") or 0) > 0.4 else "🔴 ضعیف",
                "avg_tokens_per_sec": summary.get("avg_tokens_per_sec"),
                "speed_rating": "🟢 سریع" if (summary.get("avg_tokens_per_sec") or 0) > 5 else "🟡 متوسط" if (summary.get("avg_tokens_per_sec") or 0) > 1 else "🔴 کند",
                "total_likes": summary.get("total_likes", 0),
                "total_dislikes": summary.get("total_dislikes", 0),
                "like_ratio": summary.get("like_ratio"),
                "satisfaction_label": "😊 راضی" if (summary.get("like_ratio") or 0) > 0.7 else "😐 متوسط" if (summary.get("like_ratio") or 0) > 0.4 else "😞 ناراضی",
                "total_models": len(models),
                "active_models": sum(1 for m in models if m["status"] == "active"),
                "backup_models": sum(1 for m in models if m["status"] == "backup"),
                "total_training_data": train_data_collector.get_collection_stats().get("total_all", 0),
            },

            # ── مدل فعال ──
            "active_model": {
                "name": active.name if active else "N/A",
                "model_id": active.model_id if active else "N/A",
                "format_version": active.format_version if active else "N/A",
                "model_type": active.model_type if active else "N/A",
                "status": active.status if active else "N/A",
                "created_at": active.created_at if active else "N/A",
                "quality_score": active.metrics.get("quality_score") if active and active.metrics else None,
                "avg_tps": active.metrics.get("avg_tps") if active and active.metrics else None,
            } if active else None,

            # ── تحلیل Drift ──
            "drift_analysis": drift_report,

            # ── روند روزانه ──
            "daily_trend": daily_trend,

            # ── همه مدل‌ها ──
            "models_overview": [
                {
                    "model_id": m["model_id"],
                    "name": m["name"],
                    "status": m["status"],
                    "format": m["format_version"],
                    "type": m["model_type"],
                    "created_at": m.get("created_at"),
                }
                for m in models
            ],

            # ── آمار داده‌های آموزشی ──
            "training_data": {
                "liked": train_data_collector.get_collection_stats().get("total_liked", 0),
                "disliked": train_data_collector.get_collection_stats().get("total_disliked", 0),
                "general": train_data_collector.get_collection_stats().get("total_general", 0),
                "total": train_data_collector.get_collection_stats().get("total_all", 0),
                "like_ratio": train_data_collector.get_collection_stats().get("like_ratio"),
                "ready_for_finetune": train_data_collector.get_collection_stats().get("total_liked", 0) > 50,
            },
        }
    }


# ====================================================================
# ۲. داده سری زمانی با ابعاد مختلف (برای نمودارهای Power BI)
# ====================================================================
@router.get("/timeseries")
async def performance_timeseries(
    hours: int = 720,        # ۳۰ روز
    interval: str = "day",   # hour | day | week
    model_id: Optional[str] = None,
    dimension: str = "all",  # all | quality | speed | feedback | tokens
):
    """
    📈 **داده سری زمانی با ابعاد تحلیلی مختلف**
    
    ابعاد قابل انتخاب:
    - `all`: همه معیارها
    - `quality`: فقط کیفیت
    - `speed`: فقط سرعت
    - `feedback`: فقط بازخورد
    - `tokens`: فقط توکن‌ها
    
    بازه‌های زمانی:
    - `hour`: ساعتی
    - `day`: روزانه
    - `week`: هفتگی
    """
    cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
    records = [
        r for r in performance_tracker.history
        if r["timestamp"] >= cutoff and (model_id is None or r["model_id"] == model_id)
    ]

    buckets = defaultdict(lambda: {
        "count": 0, "scores": [], "tps": [],
        "likes": 0, "dislikes": 0,
        "prompt_lengths": [], "response_lengths": [],
        "inference_times": [], "token_counts": [],
        "perplexities": [], "repetition_rates": [],
    })

    for r in records:
        ts = datetime.fromisoformat(r["timestamp"])
        if interval == "hour":
            key = ts.strftime("%Y-%m-%d %H:00")
        elif interval == "week":
            # هفته را بر اساس سال-شماره هفته تعیین می‌کنیم
            iso_year, iso_week, _ = ts.isocalendar()
            key = f"{iso_year}-W{iso_week:02d}"
        else:
            key = ts.strftime("%Y-%m-%d")

        b = buckets[key]
        b["count"] += 1
        if r.get("quality_score"): b["scores"].append(r["quality_score"])
        if r.get("tokens_per_sec"): b["tps"].append(r["tokens_per_sec"])
        if r.get("user_feedback") == "like": b["likes"] += 1
        elif r.get("user_feedback") == "dislike": b["dislikes"] += 1
        if r.get("prompt_length"): b["prompt_lengths"].append(r["prompt_length"])
        if r.get("response_length"): b["response_lengths"].append(r["response_length"])
        if r.get("inference_time_s"): b["inference_times"].append(r["inference_time_s"])
        if r.get("tokens_generated"): b["token_counts"].append(r["tokens_generated"])
        if r.get("perplexity"): b["perplexities"].append(r["perplexity"])
        if r.get("repetition_rate"): b["repetition_rates"].append(r["repetition_rate"])

    timeseries = []
    for key in sorted(buckets.keys()):
        b = buckets[key]
        entry = {"timestamp": key}

        if dimension in ("all", "quality"):
            entry.update({
                "request_count": b["count"],
                "avg_quality": round(mean(b["scores"]), 4) if b["scores"] else None,
                "min_quality": round(min(b["scores"]), 4) if b["scores"] else None,
                "max_quality": round(max(b["scores"]), 4) if b["scores"] else None,
                "quality_volatility": round(stdev(b["scores"]), 4) if len(b["scores"]) > 1 else None,
            })

        if dimension in ("all", "speed"):
            entry.update({
                "avg_tps": round(mean(b["tps"]), 2) if b["tps"] else None,
                "min_tps": round(min(b["tps"]), 2) if b["tps"] else None,
                "max_tps": round(max(b["tps"]), 2) if b["tps"] else None,
                "avg_inference_time_s": round(mean(b["inference_times"]), 3) if b["inference_times"] else None,
            })

        if dimension in ("all", "feedback"):
            entry.update({
                "likes": b["likes"],
                "dislikes": b["dislikes"],
                "like_ratio": round(b["likes"] / (b["likes"] + b["dislikes"]), 3) if (b["likes"] + b["dislikes"]) > 0 else None,
                "satisfaction_score": round(b["likes"] / (b["likes"] + b["dislikes"] + b["count"] * 0.1), 3) if b["count"] > 0 else None,
            })

        if dimension in ("all", "tokens"):
            entry.update({
                "avg_prompt_length": round(mean(b["prompt_lengths"]), 1) if b["prompt_lengths"] else None,
                "avg_response_length": round(mean(b["response_lengths"]), 1) if b["response_lengths"] else None,
                "avg_tokens_generated": round(mean(b["token_counts"]), 1) if b["token_counts"] else None,
                "avg_perplexity": round(mean(b["perplexities"]), 2) if b["perplexities"] else None,
                "avg_repetition_rate": round(mean(b["repetition_rates"]), 4) if b["repetition_rates"] else None,
            })

        timeseries.append(entry)

    return {
        "success": True,
        "meta": {
            "interval": interval,
            "total_records": len(records),
            "data_points": len(timeseries),
            "date_range": {
                "from": records[0]["timestamp"][:10] if records else None,
                "to": records[-1]["timestamp"][:10] if records else None,
            },
        },
        "timeseries": timeseries,
    }


# ====================================================================
# ۳. تحلیل روزهای هفته و ساعات شبانه‌روز
# ====================================================================
@router.get("/hourly-pattern")
async def hourly_pattern(hours: int = 720):
    """
    🕐 **الگوی استفاده در ساعات مختلف شبانه‌روز**
    
    برای تحلیل:
    - کدام ساعت‌ها بیشترین درخواست را دارند؟
    - کیفیت پاسخ در ساعات مختلف چطور است؟
    - سرعت مدل در ساعات اوج مصرف
    """
    cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
    records = [r for r in performance_tracker.history if r["timestamp"] >= cutoff]

    hourly = defaultdict(lambda: {"count": 0, "scores": [], "tps": [], "likes": 0, "dislikes": 0})
    for r in records:
        ts = datetime.fromisoformat(r["timestamp"])
        hour = ts.hour
        h = hourly[hour]
        h["count"] += 1
        if r.get("quality_score"): h["scores"].append(r["quality_score"])
        if r.get("tokens_per_sec"): h["tps"].append(r["tokens_per_sec"])
        if r.get("user_feedback") == "like": h["likes"] += 1
        elif r.get("user_feedback") == "dislike": h["dislikes"] += 1

    pattern = []
    for hour in sorted(hourly.keys()):
        h = hourly[hour]
        pattern.append({
            "hour": hour,
            "hour_label": f"{hour:02d}:00",
            "request_count": h["count"],
            "request_percentage": round(h["count"] / len(records) * 100, 2) if records else 0,
            "avg_quality": round(mean(h["scores"]), 4) if h["scores"] else None,
            "avg_tps": round(mean(h["tps"]), 2) if h["tps"] else None,
            "likes": h["likes"],
            "dislikes": h["dislikes"],
        })

    return {
        "success": True,
        "pattern": pattern,
        "peak_hour": max(pattern, key=lambda x: x["request_count"]) if pattern else None,
        "best_quality_hour": max(pattern, key=lambda x: x["avg_quality"] or 0) if pattern else None,
    }


@router.get("/weekly-pattern")
async def weekly_pattern(hours: int = 720):
    """
    📅 **الگوی استفاده در روزهای هفته**
    
    برای تحلیل:
    - کدام روزهای هفته بیشترین استفاده را دارند؟
    - کیفیت پاسخ در روزهای مختلف
    - مقایسه روزهای کاری با تعطیلات
    """
    cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
    records = [r for r in performance_tracker.history if r["timestamp"] >= cutoff]

    weekday_names = {
        0: "دوشنبه", 1: "سه‌شنبه", 2: "چهارشنبه",
        3: "پنجشنبه", 4: "جمعه", 5: "شنبه", 6: "یکشنبه",
    }
    weekday_en = {
        0: "Monday", 1: "Tuesday", 2: "Wednesday",
        3: "Thursday", 4: "Friday", 5: "Saturday", 6: "Sunday",
    }

    weekly = defaultdict(lambda: {"count": 0, "scores": [], "tps": [], "likes": 0, "dislikes": 0})
    for r in records:
        ts = datetime.fromisoformat(r["timestamp"])
        day = ts.weekday()
        w = weekly[day]
        w["count"] += 1
        if r.get("quality_score"): w["scores"].append(r["quality_score"])
        if r.get("tokens_per_sec"): w["tps"].append(r["tokens_per_sec"])
        if r.get("user_feedback") == "like": w["likes"] += 1
        elif r.get("user_feedback") == "dislike": w["dislikes"] += 1

    pattern = []
    for day in sorted(weekly.keys()):
        w = weekly[day]
        pattern.append({
            "day_of_week": day,
            "day_name_fa": weekday_names.get(day, "Unknown"),
            "day_name_en": weekday_en.get(day, "Unknown"),
            "is_weekend": day >= 4,  # جمعه و شنبه تعطیل
            "request_count": w["count"],
            "request_percentage": round(w["count"] / len(records) * 100, 2) if records else 0,
            "avg_quality": round(mean(w["scores"]), 4) if w["scores"] else None,
            "avg_tps": round(mean(w["tps"]), 2) if w["tps"] else None,
            "likes": w["likes"],
            "dislikes": w["dislikes"],
        })

    return {
        "success": True,
        "pattern": pattern,
        "peak_day": max(pattern, key=lambda x: x["request_count"]) if pattern else None,
    }


# ====================================================================
# ۴. تحلیل بازخورد کاربران
# ====================================================================
@router.get("/feedback-analysis")
async def feedback_analysis(hours: int = 720):
    """
    👍👎 **تحلیل کامل بازخورد کاربران**
    
    شاخص‌ها:
    - نسبت رضایت (Satisfaction Rate)
    - روند بازخورد در طول زمان
    - توزیع امتیاز کیفیت برای پاسخ‌های لایک و دیس‌لایک
    - NPS (Net Promoter Score)
    """
    cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
    records = [r for r in performance_tracker.history if r["timestamp"] >= cutoff]

    liked = [r for r in records if r.get("user_feedback") == "like"]
    disliked = [r for r in records if r.get("user_feedback") == "dislike"]
    no_feedback = [r for r in records if r.get("user_feedback") in (None, "none")]

    total_feedback = len(liked) + len(disliked)

    # کیفیت پاسخ‌های لایک شده
    liked_qualities = [r["quality_score"] for r in liked if r.get("quality_score")]
    disliked_qualities = [r["quality_score"] for r in disliked if r.get("quality_score")]

    return {
        "success": True,
        "feedback_overview": {
            "total_records": len(records),
            "total_feedback": total_feedback,
            "feedback_rate": round(total_feedback / len(records) * 100, 2) if records else 0,
            "likes": len(liked),
            "dislikes": len(disliked),
            "no_feedback": len(no_feedback),
            "like_ratio": round(len(liked) / total_feedback, 3) if total_feedback > 0 else None,
            "dislike_ratio": round(len(disliked) / total_feedback, 3) if total_feedback > 0 else None,
        },
        "quality_by_feedback": {
            "avg_quality_liked": round(mean(liked_qualities), 4) if liked_qualities else None,
            "avg_quality_disliked": round(mean(disliked_qualities), 4) if disliked_qualities else None,
            "quality_gap": round(mean(liked_qualities) - mean(disliked_qualities), 4) if liked_qualities and disliked_qualities else None,
        },
        "satisfaction_metrics": {
            "satisfaction_rate": round(len(liked) / (len(liked) + len(disliked)) * 100, 2) if (len(liked) + len(disliked)) > 0 else None,
            "nps_score": round((len(liked) - len(disliked)) / (len(liked) + len(disliked)) * 100, 2) if (len(liked) + len(disliked)) > 0 else None,
            # NPS: -100 to +100
            "nps_label": "عالی 🟢" if (len(liked) - len(disliked)) / (total_feedback + 0.001) > 0.5 else "خوب 🟡" if (len(liked) - len(disliked)) / (total_feedback + 0.001) > 0 else "نیاز به بهبود 🔴",
        },
    }


# ====================================================================
# ۵. مقایسه کامل مدل‌ها
# ====================================================================
@router.get("/model-comparison")
async def model_comparison():
    """
    📊 **مقایسه همه مدل‌ها در تمام معیارها**
    
    مناسب برای:
    - نمودار میله‌ای مقایسه (Bar Chart)
    - نمودار راداری (Radar Chart)
    - جدول مقایسه (Table)
    """
    models = model_registry.list_all()
    comparisons = []

    for m in models:
        model_id = m["model_id"]
        stats = performance_tracker.get_model_stats(model_id, last_n=1000)

        # محاسبه امتیاز کلی (Composite Score)
        quality = stats.get("avg_quality_score") or 0
        speed = min(1.0, (stats.get("avg_tokens_per_sec") or 0) / 10)  # نرمالایز تا ۱
        satisfaction = stats.get("like_ratio") or 0

        composite = round(0.5 * quality + 0.3 * speed + 0.2 * satisfaction, 4)

        comparisons.append({
            "model_id": model_id,
            "name": m["name"],
            "status": m["status"],
            "format": m["format_version"],
            "type": m["model_type"],
            "created_at": m.get("created_at"),
            
            # معیارهای اصلی
            "avg_quality_score": stats.get("avg_quality_score"),
            "avg_tokens_per_sec": stats.get("avg_tokens_per_sec"),
            "likes": stats.get("likes", 0),
            "dislikes": stats.get("dislikes", 0),
            "like_ratio": stats.get("like_ratio"),
            "total_requests": stats.get("count", 0),
            
            # امتیاز ترکیبی
            "composite_score": composite,
            "composite_label": "🟢 عالی" if composite > 0.7 else "🟡 خوب" if composite > 0.5 else "🔴 ضعیف",
            
            # جزئیات امتیاز
            "quality_component": round(0.5 * quality, 4),
            "speed_component": round(0.3 * speed, 4),
            "satisfaction_component": round(0.2 * satisfaction, 4),
        })

    # مرتب‌سازی بر اساس امتیاز ترکیبی
    comparisons.sort(key=lambda x: x["composite_score"], reverse=True)

    return {
        "success": True,
        "best_model": comparisons[0] if comparisons else None,
        "worst_model": comparisons[-1] if comparisons and len(comparisons) > 1 else None,
        "models": comparisons,
    }


# ====================================================================
# ۶. گزارش انحراف داده (Data Drift) کامل
# ====================================================================
@router.get("/drift-report")
async def drift_report_full(days: int = 30):
    """
    📉 **گزارش کامل انحراف داده (Data Drift)**
    
    شامل:
    - مقایسه توزیع پرامپت‌ها در طول زمان
    - تغییرات کیفیت پاسخ
    - هشدار در صورت افت
    """
    active = model_registry.get_active_model()
    if not active:
        return {"success": False, "message": "مدل فعالی وجود ندارد"}

    report = performance_tracker.get_recent_drift_report(active.model_id)
    
    # تحلیل عمیق‌تر: مقایسه توزیع طول پرامپت
    cutoff = (datetime.now() - timedelta(days=days)).isoformat()
    records = [r for r in performance_tracker.history if r["timestamp"] >= cutoff]

    if len(records) >= 20:
        mid = len(records) // 2
        old_half = records[:mid]
        new_half = records[mid:]

        old_prompt_lengths = [r.get("prompt_length", 0) for r in old_half if r.get("prompt_length")]
        new_prompt_lengths = [r.get("prompt_length", 0) for r in new_half if r.get("prompt_length")]
        old_response_lengths = [r.get("response_length", 0) for r in old_half if r.get("response_length")]
        new_response_lengths = [r.get("response_length", 0) for r in new_half if r.get("response_length")]

        report["distribution_comparison"] = {
            "prompt_length": {
                "old_avg": round(mean(old_prompt_lengths), 1) if old_prompt_lengths else None,
                "new_avg": round(mean(new_prompt_lengths), 1) if new_prompt_lengths else None,
                "change_pct": round((mean(new_prompt_lengths) - mean(old_prompt_lengths)) / mean(old_prompt_lengths) * 100, 2) if old_prompt_lengths and new_prompt_lengths and mean(old_prompt_lengths) > 0 else None,
            },
            "response_length": {
                "old_avg": round(mean(old_response_lengths), 1) if old_response_lengths else None,
                "new_avg": round(mean(new_response_lengths), 1) if new_response_lengths else None,
                "change_pct": round((mean(new_response_lengths) - mean(old_response_lengths)) / mean(old_response_lengths) * 100, 2) if old_response_lengths and new_response_lengths and mean(old_response_lengths) > 0 else None,
            },
        }

    return {
        "success": True,
        "report": report,
    }


# ====================================================================
# ۷. خروجی CSV کامل برای Power BI
# ====================================================================
@router.get("/export-csv")
async def export_csv(hours: int = 2160, model_id: Optional[str] = None):
    """
    📁 **خروجی CSV کامل برای Power BI**

    تمام رکوردهای عملکرد با تمام ابعاد:
    - زمان، مدل، طول پرامپت و پاسخ
    - سرعت، کیفیت، پریپلکسیتی، نرخ تکرار
    - بازخورد کاربر
    - روز هفته، ساعت
    """
    cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
    records = [
        r for r in performance_tracker.history
        if r["timestamp"] >= cutoff and (model_id is None or r["model_id"] == model_id)
    ]

    output = io.StringIO()
    writer = csv.writer(output)

    # هدر با تمام ستون‌های تحلیلی
    writer.writerow([
        "Timestamp", "Year", "Month", "Day", "Hour", "DayOfWeek", "IsWeekend",
        "ModelID", "PromptLength", "ResponseLength",
        "InferenceTime_S", "TokensPerSec",
        "Perplexity", "RepetitionRate",
        "UserFeedback", "QualityScore",
        "IsGoodQuality", "IsFastResponse", "IsLiked",
    ])

    for r in records:
        ts = datetime.fromisoformat(r["timestamp"])
        quality = r.get("quality_score") or 0
        tps = r.get("tokens_per_sec") or 0

        writer.writerow([
            r.get("timestamp"),
            ts.year, ts.month, ts.day, ts.hour, ts.weekday(),
            1 if ts.weekday() >= 4 else 0,  # IsWeekend
            r.get("model_id"),
            r.get("prompt_length"),
            r.get("response_length"),
            r.get("inference_time_s"),
            r.get("tokens_per_sec"),
            r.get("perplexity"),
            r.get("repetition_rate"),
            r.get("user_feedback"),
            quality,
            1 if quality > 0.6 else 0,  # IsGoodQuality
            1 if tps > 3 else 0,         # IsFastResponse
            1 if r.get("user_feedback") == "like" else 0,  # IsLiked
        ])

    csv_content = output.getvalue()
    filename = f"mlops_full_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
        },
    )


# ====================================================================
# ۸. خلاصه سریع برای API health
# ====================================================================
@router.get("/health")
async def powerbi_health():
    """وضعیت ماژول گزارش‌دهی Power BI"""
    summary = performance_tracker.summarize_range(24)
    return {
        "success": True,
        "service": "Power BI Report API",
        "status": "✅ فعال و آماده",
        "total_records_in_database": len(performance_tracker.history),
        "records_last_24h": summary.get("total", 0),
        "registered_models": model_registry.count(),
        "endpoints": [
            {"path": "/api/v1/powerbi/dashboard-summary", "desc": "خلاصه کامل داشبورد"},
            {"path": "/api/v1/powerbi/timeseries", "desc": "داده سری زمانی با ابعاد تحلیلی"},
            {"path": "/api/v1/powerbi/hourly-pattern", "desc": "الگوی ساعتی استفاده"},
            {"path": "/api/v1/powerbi/weekly-pattern", "desc": "الگوی هفتگی استفاده"},
            {"path": "/api/v1/powerbi/feedback-analysis", "desc": "تحلیل بازخورد کاربران"},
            {"path": "/api/v1/powerbi/model-comparison", "desc": "مقایسه همه مدل‌ها"},
            {"path": "/api/v1/powerbi/drift-report", "desc": "گزارش انحراف داده"},
            {"path": "/api/v1/powerbi/export-csv", "desc": "خروجی CSV کامل"},
        ],
        "how_to_use_in_powerbi": {
            "csv_import": "GET /api/v1/powerbi/export-csv → import in Power BI as CSV",
            "json_api": "GET /api/v1/powerbi/dashboard-summary → Power BI Web connector",
            "refresh": "Auto-refresh every hour recommended",
        },
    }
