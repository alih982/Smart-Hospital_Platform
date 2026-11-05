"""
MLOps Module - Version 1.0
مدیریت چرخهٔ کامل مدل‌ها: ثبت، مقایسه، جایگزینی، بازگشت
"""
from .model_registry import ModelRegistry
from .performance_tracker import PerformanceTracker
from .model_swapper import ModelSwapper
from .train_data_collector import TrainDataCollector

model_registry = ModelRegistry()
performance_tracker = PerformanceTracker()
model_swapper = ModelSwapper()
train_data_collector = TrainDataCollector()

__all__ = [
    "model_registry",
    "performance_tracker",
    "model_swapper",
    "train_data_collector",
    "ModelRegistry",
    "PerformanceTracker",
    "ModelSwapper",
    "TrainDataCollector",
]
