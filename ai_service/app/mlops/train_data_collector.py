"""
Train Data Collector - جمع‌آوری داده برای فاین‌تیون
بر اساس بازخورد کاربران (لایک/دیس‌لایک) داده جمع می‌کند
"""
import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# فایل‌های ذخیره داده
LIKE_DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "training_data_liked.jsonl")
DISLIKE_DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "training_data_disliked.jsonl")
DATASET_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "training_dataset.jsonl")


class TrainDataCollector:
    """
    جمع‌آوری و آماده‌سازی دیتاست برای فاین‌تیون
    
    وظایف:
    - ذخیره پرامپت + پاسخ + امتیاز
    - فیلتر کردن پاسخ‌های با کیفیت (لایک)
    - تولید دیتاست آموزشی در فرمت JSONL
    - آماده‌سازی برای QLoRA
    """

    def __init__(self):
        os.makedirs(os.path.dirname(LIKE_DATA_FILE), exist_ok=True)

    def record_interaction(
        self,
        prompt: str,
        response: str,
        user_feedback: Optional[str] = None,
        quality_score: Optional[float] = None,
        model_id: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ):
        """
        ثبت یک تعامل کاربر برای جمع‌آوری داده
        
        Args:
            prompt: پرامپت کاربر
            response: پاسخ مدل
            user_feedback: like یا dislike
            quality_score: امتیاز کیفیت (اختیاری)
            model_id: شناسه مدل (اختیاری)
            metadata: اطلاعات اضافی (اختیاری)
        """
        record = {
            "timestamp": datetime.now().isoformat(),
            "prompt": prompt,
            "response": response,
            "user_feedback": user_feedback,
            "quality_score": quality_score,
            "model_id": model_id or "unknown",
            "metadata": metadata or {},
        }

        # ذخیره در فایل مناسب
        if user_feedback == "like":
            self._append_jsonl(LIKE_DATA_FILE, record)
            logger.info(f"👍 داده با لایک ذخیره شد ({len(prompt)} کاراکتر)")
        elif user_feedback == "dislike":
            self._append_jsonl(DISLIKE_DATA_FILE, record)
            logger.info(f"👎 داده با دیس‌لایک ذخیره شد ({len(prompt)} کاراکتر)")
        else:
            # بدون بازخورد، در فایل عمومی
            self._append_jsonl(DATASET_FILE, record)

    def _append_jsonl(self, filepath: str, record: Dict):
        """افزودن یک رکورد به فایل JSONL"""
        try:
            with open(filepath, "a") as f:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
        except Exception as e:
            logger.error(f"❌ خطا در نوشتن فایل {filepath}: {e}")

    def get_liked_data(self, limit: int = 1000) -> List[Dict]:
        """دریافت داده‌های با لایک"""
        return self._read_jsonl(LIKE_DATA_FILE, limit)

    def get_disliked_data(self, limit: int = 100) -> List[Dict]:
        """دریافت داده‌های با دیس‌لایک"""
        return self._read_jsonl(DISLIKE_DATA_FILE, limit)

    def _read_jsonl(self, filepath: str, limit: int = -1) -> List[Dict]:
        """خواندن فایل JSONL"""
        records = []
        if not os.path.exists(filepath):
            return records
        try:
            with open(filepath, "r") as f:
                for i, line in enumerate(f):
                    if limit > 0 and i >= limit:
                        break
                    line = line.strip()
                    if line:
                        records.append(json.loads(line))
        except Exception as e:
            logger.error(f"❌ خطا در خواندن {filepath}: {e}")
        return records

    def generate_training_dataset(
        self,
        min_quality: float = 0.3,
        max_samples: int = 500,
        include_disliked: bool = False,
        output_format: str = "alpaca",
    ) -> str:
        """
        تولید دیتاست آموزشی از داده‌های جمع‌آوری شده
        
        Args:
            min_quality: حداقل امتیاز کیفیت
            max_samples: حداکثر تعداد نمونه
            include_disliked: آیا داده‌های دیس‌لایک هم اضافه شود (با برچسب منفی)
            output_format: فرمت خروجی (alpaca, chat, sharegpt)
            
        Returns:
            str: مسیر فایل دیتاست تولید شده
        """
        # جمع‌آوری داده‌ها
        liked = self.get_liked_data(max_samples)

        # فیلتر بر اساس امتیاز
        if min_quality > 0:
            liked = [r for r in liked if (r.get("quality_score") or 0.5) >= min_quality]

        disliked = []
        if include_disliked:
            disliked = self.get_disliked_data(max_samples // 5)

        dataset = []

        if output_format == "alpaca":
            # فرمت Alpaca: instruction, input, output
            for rec in liked:
                dataset.append({
                    "instruction": rec["prompt"],
                    "input": "",
                    "output": rec["response"],
                })
            if include_disliked:
                for rec in disliked:
                    dataset.append({
                        "instruction": rec["prompt"],
                        "input": "",
                        "output": f"[LOW_QUALITY] {rec['response']}",
                    })

        elif output_format == "chat":
            # فرمت Chat: messages
            for rec in liked:
                dataset.append({
                    "messages": [
                        {"role": "user", "content": rec["prompt"]},
                        {"role": "assistant", "content": rec["response"]},
                    ]
                })

        elif output_format == "sharegpt":
            # فرمت ShareGPT
            for rec in liked:
                dataset.append({
                    "conversations": [
                        {"from": "human", "value": rec["prompt"]},
                        {"from": "gpt", "value": rec["response"]},
                    ]
                })

        # ذخیره
        output_file = os.path.join(
            os.path.dirname(__file__), "..", "data",
            f"training_dataset_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jsonl"
        )
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file, "w") as f:
            for item in dataset:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

        logger.info(f"✅ دیتاست آموزشی با {len(dataset)} رکورد ذخیره شد: {output_file}")
        return output_file

    def get_collection_stats(self) -> Dict:
        """آمار داده‌های جمع‌آوری شده"""
        liked = self.get_liked_data()
        disliked = self.get_disliked_data()
        general = self._read_jsonl(DATASET_FILE)

        return {
            "total_liked": len(liked),
            "total_disliked": len(disliked),
            "total_general": len(general),
            "total_all": len(liked) + len(disliked) + len(general),
            "like_ratio": round(len(liked) / (len(liked) + len(disliked) + 0.001), 3),
        }

    def export_for_colab(self, output_path: Optional[str] = None) -> str:
        """
        خروجی گرفتن از دیتاست برای آپلود به Google Colab
        
        Returns:
            str: مسیر فایل ZIP شده
        """
        import zipfile

        dataset_path = self.generate_training_dataset(max_samples=200)

        output_path = output_path or os.path.join(
            os.path.dirname(__file__), "..", "data", "colab_dataset.zip"
        )

        with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.write(dataset_path, os.path.basename(dataset_path))
            # کپی اسکریپت فاین‌تیون
            script_path = os.path.join(os.path.dirname(__file__), "..", "scripts", "finetune_gemma.py")
            if os.path.exists(script_path):
                zf.write(script_path, "finetune_gemma.py")

        logger.info(f"📦 دیتاست برای Colab آماده شد: {output_path}")
        return output_path
