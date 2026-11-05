"""
Core models for Smart Health Platform
Includes ModelLog for tracking AI inference logs
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class BaseModel(models.Model):
    """
    Abstract base model with common fields for all models
    """
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('updated at'))
    is_deleted = models.BooleanField(default=False, db_index=True, verbose_name=_('is deleted'))

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.__class__.__name__} #{self.pk}"

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.save(update_fields=['is_deleted', 'updated_at'])

    def hard_delete(self, using=None, keep_parents=False):
        super().delete(using=using, keep_parents=keep_parents)


class ChatMode(models.TextChoices):
    COMPANY_INFO = 'company_info', _('Company Info / RAG')
    AI_RESPONSE = 'ai_response', _('AI Response / Fine-tuned')
    HUMAN_SUPPORT = 'human_support', _('Human Support')


class SystemSettings(BaseModel):
    """
    Global system settings for the platform
    """
    chat_mode = models.CharField(
        max_length=50,
        choices=ChatMode.choices,
        default=ChatMode.AI_RESPONSE,
        verbose_name=_('chat mode'),
    )
    ai_provider = models.CharField(max_length=100, blank=True, verbose_name=_('AI provider'))
    ai_model_name = models.CharField(max_length=255, blank=True, verbose_name=_('AI model name'))
    rag_enabled = models.BooleanField(default=True, verbose_name=_('RAG enabled'))
    human_support_active = models.BooleanField(default=False, verbose_name=_('human support active'))
    company_name = models.CharField(max_length=255, blank=True, verbose_name=_('company name'))
    company_description = models.TextField(blank=True, verbose_name=_('company description'))
    support_start_time = models.TimeField(null=True, blank=True, verbose_name=_('support start time'))
    support_end_time = models.TimeField(null=True, blank=True, verbose_name=_('support end time'))

    class Meta:
        verbose_name = _('System Settings')
        verbose_name_plural = _('System Settings')

    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


class ModelLog(models.Model):
    """
    ذخیره لاگ‌های عملکرد مدل هوش مصنوعی
    برای تحلیل و بهبود مدل و گزارش‌های Power BI
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('user'),
    )
    model_id = models.CharField(max_length=255, blank=True, verbose_name=_('model ID'))
    model_name = models.CharField(max_length=255, blank=True, verbose_name=_('model name'))
    model_version = models.CharField(max_length=255, blank=True, verbose_name=_('model version'))
    prompt = models.TextField(verbose_name=_('prompt'))
    response = models.TextField(blank=True, verbose_name=_('response'))
    prompt_length = models.IntegerField(null=True, blank=True, verbose_name=_('prompt length'))
    response_length = models.IntegerField(null=True, blank=True, verbose_name=_('response length'))
    inference_time_s = models.FloatField(null=True, blank=True, verbose_name=_('inference time (s)'))
    tokens_generated = models.IntegerField(null=True, blank=True, verbose_name=_('tokens generated'))
    input_tokens = models.IntegerField(null=True, blank=True, verbose_name=_('input tokens'))
    tokens_per_sec = models.FloatField(null=True, blank=True, verbose_name=_('tokens per second'))
    perplexity = models.FloatField(null=True, blank=True, verbose_name=_('perplexity'))
    repetition_rate = models.FloatField(null=True, blank=True, verbose_name=_('repetition rate'))
    quality_score = models.FloatField(null=True, blank=True, verbose_name=_('quality score'))
    
    # Feedback fields
    user_feedback = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        choices=[('like', _('Like')), ('dislike', _('Dislike')), ('none', _('None'))],
        verbose_name=_('user feedback'),
    )
    feedback_timestamp = models.DateTimeField(null=True, blank=True, verbose_name=_('feedback time'))
    user_comment = models.TextField(blank=True, verbose_name=_('user comment'))
    
    # Metadata
    conversation_id = models.CharField(max_length=255, blank=True, verbose_name=_('conversation ID'))
    system_prompt = models.TextField(blank=True, verbose_name=_('system prompt'))
    temperature = models.FloatField(null=True, blank=True, verbose_name=_('temperature'))
    top_p = models.FloatField(null=True, blank=True, verbose_name=_('top_p'))
    max_tokens = models.IntegerField(null=True, blank=True, verbose_name=_('max tokens'))
    n_ctx = models.IntegerField(null=True, blank=True, verbose_name=_('context window'))
    n_threads = models.IntegerField(null=True, blank=True, verbose_name=_('threads'))
    device = models.CharField(max_length=50, blank=True, verbose_name=_('device'))
    error = models.TextField(blank=True, verbose_name=_('error'))
    metadata = models.JSONField(null=True, blank=True, verbose_name=_('metadata'))
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('updated at'))

    class Meta:
        verbose_name = _('Model Log')
        verbose_name_plural = _('Model Logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['model_id', 'created_at']),
            models.Index(fields=['user_feedback']),
        ]

    def __str__(self):
        return f"ModelLog #{self.id} | {self.model_name or self.model_id} | {self.created_at:%Y-%m-%d %H:%M}"


class FeedbackLog(models.Model):
    """
    بازخورد کاربران روی پاسخ‌های مدل
    برای جمع‌آوری داده و فاین‌تیون
    """
    model_log = models.ForeignKey(
        ModelLog,
        on_delete=models.CASCADE,
        related_name='feedback_logs',
        verbose_name=_('model log'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('user'),
    )
    feedback_type = models.CharField(
        max_length=50,
        choices=[('like', _('Like')), ('dislike', _('Dislike'))],
        verbose_name=_('feedback type'),
    )
    comment = models.TextField(blank=True, verbose_name=_('comment'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))

    class Meta:
        verbose_name = _('Feedback Log')
        verbose_name_plural = _('Feedback Logs')
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback {self.feedback_type} | Log #{self.model_log_id}"
