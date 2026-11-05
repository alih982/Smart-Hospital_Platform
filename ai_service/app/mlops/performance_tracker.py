"""
Performance Tracker - ردیابی عملکرد مدل در طول زمان
محاسبه امتیاز کیفیت و تشخیص افت کیفیت (Data Drift)
"""
import os
import json
import logging
import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from statistics import mean, stdev

logger = logging.getLogger(__name__)

PERF_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "performance_history.json")


class PerformanceTracker:
    """
    ردیابی و مقایسه عملکرد مدل‌ها
    
    وظایف:
    - ثبت هر inference با معیارهایش
    - محاسبه میانگین متحرک کیفیت
    - تشخیص افت کیفیت (data drift)
    - مقایسه دو مدل با آمار
    """

    def __init__(self, perf_path: str = PERF_FILE):
        self.perf_path = perf_path
        self.history: List[Dict] = []
        self._load()

    def _load(self):
        os.makedirs(os.path.dirname(self.perf_path), exist_ok=True)
        if os.path.exists(self.perf_path):
            try:
                with open(self.perf_path, "r") as f:
                    self.history = json.load(f)
                logger.info(f"📊 {len(self.history)} رکورد عملکرد بارگذاری شد")
            except Exception as e:
                logger.warning(f"⚠️ خطا در بارگذاری تاریخچه عملکرد: {e}")
                self.history = []

    def _save(self):
        try:
            with open(self.perf_path, "w") as f:
                json.dump(self.history[-5000:], f, indent=2, ensure_ascii=False)  # حداکثر ۵۰۰۰ رکورد
        except Exception as e:
            logger.error(f"❌ خطا در ذخیره تاریخچه: {e}")

    def record_inference(
        self,
        model_id: str,
        prompt_length: int,
        response_length: int,
        inference_time_s: float,
        perplexity: Optional[float] = None,
        repetition_rate: Optional[float] = None,
        user_feedback: Optional[str] = None,  # like | dislike | None
    ):
        """ثبت یک بار inference با معیارهایش"""
        # امتیاز کیفیت ترکیبی
        quality_score = self._calculate_quality_score(
            inference_time_s=inference_time_s,
            response_length=response_length,
            perplexity=perplexity,
            repetition_rate=repetition_rate,
            user_feedback=user_feedback,
        )

        record = {
            "timestamp": datetime.now().isoformat(),
            "model_id": model_id,
            "prompt_length": prompt_length,
            "response_length": response_length,
            "inference_time_s": round(inference_time_s, 3),
            "tokens_per_sec": round(response_length / inference_time_s, 2) if inference_time_s > 0 else 0,
            "perplexity": round(perplexity, 4) if perplexity else None,
            "repetition_rate": round(repetition_rate, 4) if repetition_rate else None,
            "user_feedback": user_feedback,
            "quality_score": round(quality_score, 4),
        }
        self.history.append(record)
        self._save()

    def _calculate_quality_score(
        self,
        inference_time_s: float,
        response_length: int,
        perplexity: Optional[float] = None,
        repetition_rate: Optional[float] = None,
        user_feedback: Optional[str] = None,
    ) -> float:
        """
        محاسبه امتیاز کیفیت ترکیبی (۰ تا ۱)
        معیارها:
        - سرعت (tokens/sec): هرچه بیشتر بهتر
        - تکرار (repetition_rate): هرچه کمتر بهتر
        - پریپلکسیتی: هرچه کمتر بهتر
        - بازخورد کاربر: +۰.۲ برای لایک، -۰.۲ برای دیس‌لایک
        """
        score = 0.5  # امتیاز پایه

        # سرعت (۰ تا ۰.۳)
        if inference_time_s > 0:
            tps = response_length / inference_time_s
            speed_score = min(0.3, tps * 0.1)  # 0.3 tok/s = 0.03, 3 tok/s = 0.3
            score += speed_score

        # تکرار (۰ تا ۰.۲)
        if repetition_rate is not None:
            # repetition_rate بین ۰ تا ۱ است، هرچه کمتر بهتر
            rep_score = max(0, 0.2 - repetition_rate * 0.2)
            score += rep_score

        # پریپلکسیتی (۰ تا ۰.۲)
        if perplexity is not None:
            # perplexity < 10 = عالی، < 50 = خوب، > 100 = بد
            if perplexity < 10:
                score += 0.2
            elif perplexity < 50:
                score += 0.1
            elif perplexity < 100:
                score += 0.05
            # > 100: امتیازی نمی‌گیرد

        # بازخورد کاربر (۰.۲±)
        if user_feedback == "like":
            score += 0.2
        elif user_feedback == "dislike":
            score -= 0.2

        return max(0.0, min(1.0, score))

    def get_model_stats(self, model_id: str, last_n: int = 100) -> Dict:
        """آمار یک مدل در N رکورد آخر"""
        records = [r for r in self.history[-last_n:] if r["model_id"] == model_id]
        if not records:
            return {"model_id": model_id, "count": 0}

        scores = [r["quality_score"] for r in records if r["quality_score"] is not None]
        tps_list = [r["tokens_per_sec"] for r in records if r["tokens_per_sec"] is not None]
        likes = sum(1 for r in records if r["user_feedback"] == "like")
        dislikes = sum(1 for r in records if r["user_feedback"] == "dislike")

        return {
            "model_id": model_id,
            "count": len(records),
            "avg_quality_score": round(mean(scores), 4) if scores else None,
            "avg_tokens_per_sec": round(mean(tps_list), 2) if tps_list else None,
            "likes": likes,
            "dislikes": dislikes,
            "like_ratio": round(likes / (likes + dislikes), 3) if (likes + dislikes) > 0 else None,
        }

    def detect_drift(self, model_id: str, window_size: int = 50, threshold: float = 0.1) -> Tuple[bool, float]:
        """
        تشخیص افت کیفیت (Data Drift)
        
        Args:
            model_id: شناسه مدل
            window_size: تعداد رکوردهای اخیر برای مقایسه
            threshold: آستانه افت (مثلاً ۰.۱ یعنی ۱۰٪ افت)
            
        Returns:
            (has_drift: bool, drift_amount: float)
        """
        if len(self.history) < window_size * 2:
            return False, 0.0

        records = [r for r in self.history if r["model_id"] == model_id]
        if len(records) < window_size * 2:
            return False, 0.0

        # دو پنجره: قدیمی و جدید
        old_window = records[:window_size]
        new_window = records[-window_size:]

        old_scores = [r["quality_score"] for r in old_window if r["quality_score"] is not None]
        new_scores = [r["quality_score"] for r in new_window if r["quality_score"] is not None]

        if not old_scores or not new_scores:
            return False, 0.0

        old_avg = mean(old_scores)
        new_avg = mean(new_scores)
        drop = old_avg - new_avg

        if drop > threshold:
            logger.warning(f"⚠️ Drift detected: old={old_avg:.4f} → new={new_avg:.4f} (drop={drop:.4f})")
            return True, drop

        return False, drop

    def compare_models(
        self, model_a: str, model_b: str, last_n: int = 100
    ) -> Dict:
        """مقایسه دو مدل"""
        stats_a = self.get_model_stats(model_a, last_n)
        stats_b = self.get_model_stats(model_b, last_n)

        verdict = ""
        if stats_a["avg_quality_score"] and stats_b["avg_quality_score"]:
            if stats_a["avg_quality_score"] > stats_b["avg_quality_score"]:
                verdict = f"✅ مدل {model_a[:8]} بهتر است"
            elif stats_b["avg_quality_score"] > stats_a["avg_quality_score"]:
                verdict = f"✅ مدل {model_b[:8]} بهتر است"
            else:
                verdict = "🤝 دو مدل برابر هستند"

        return {
            "model_a": stats_a,
            "model_b": stats_b,
            "verdict": verdict,
            "comparison": {
                "quality_diff": round(stats_a["avg_quality_score"] - stats_b["avg_quality_score"], 4)
                if stats_a["avg_quality_score"] and stats_b["avg_quality_score"]
                else None,
                "speed_diff": round(stats_a["avg_tokens_per_sec"] - stats_b["avg_tokens_per_sec"], 2)
                if stats_a["avg_tokens_per_sec"] and stats_b["avg_tokens_per_sec"]
                else None,
            },
        }

    def summarize_range(self, hours: int = 24) -> Dict:
        """خلاصه عملکرد ۲۴ ساعت اخیر"""
        cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
        recent = [r for r in self.history if r["timestamp"] >= cutoff]

        if not recent:
            return {"total": 0}

        scores = [r["quality_score"] for r in recent if r["quality_score"] is not None]
        tps_list = [r["tokens_per_sec"] for r in recent if r["tokens_per_sec"] is not None]
        likes = sum(1 for r in recent if r["user_feedback"] == "like")
        dislikes = sum(1 for r in recent if r["user_feedback"] == "dislike")

        return {
            "total": len(recent),
            "avg_quality_score": round(mean(scores), 4) if scores else None,
            "avg_tokens_per_sec": round(mean(tps_list), 2) if tps_list else None,
            "total_likes": likes,
            "total_dislikes": dislikes,
            "like_ratio": round(likes / (likes + dislikes), 3) if (likes + dislikes) > 0 else None,
        }

    def get_recent_drift_report(self, model_id: str) -> Dict:
        """گزارش کاملی از وضعیت drift"""
        has_drift, drift_amount = self.detect_drift(model_id)
        stats = self.get_model_stats(model_id)
        summary = self.summarize_range()

        return {
            "model_id": model_id,
            "drift_detected": has_drift,
            "drift_amount": round(drift_amount, 4),
            "current_stats": stats,
            "daily_summary": summary,
            "recommendation": "🔄 تعویض مدل با پشتیبان" if has_drift else "✅ مدل پایدار است",
        }
