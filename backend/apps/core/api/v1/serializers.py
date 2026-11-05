"""
Serializers for core APIs - ModelLog and Feedback
"""
from rest_framework import serializers
from apps.core.models import ModelLog, FeedbackLog


class ModelLogListSerializer(serializers.ModelSerializer):
    """Serializer for listing model logs (admin dashboard)"""
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ModelLog
        fields = [
            'id', 'user', 'user_phone', 'user_name',
            'model_name', 'model_version',
            'prompt', 'response',
            'prompt_length', 'response_length',
            'inference_time_s', 'tokens_generated', 'tokens_per_sec',
            'perplexity', 'repetition_rate', 'quality_score',
            'user_feedback', 'user_comment',
            'conversation_id', 'device', 'error',
            'created_at',
        ]
    
    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.phone_number
        return 'Anonymous'


class FeedbackSubmitSerializer(serializers.Serializer):
    """Serializer for submitting feedback (like/dislike)"""
    log_id = serializers.IntegerField(required=True)
    feedback = serializers.ChoiceField(choices=['like', 'dislike'])
    comment = serializers.CharField(required=False, allow_blank=True, default='')


class ModelLogStatsSerializer(serializers.Serializer):
    """Serializer for aggregated stats"""
    total_requests = serializers.IntegerField()
    avg_quality = serializers.FloatField(allow_null=True)
    avg_tps = serializers.FloatField(allow_null=True)
    total_likes = serializers.IntegerField()
    total_dislikes = serializers.IntegerField()
    like_ratio = serializers.FloatField(allow_null=True)
    avg_inference_time = serializers.FloatField(allow_null=True)


class TopResponsesSerializer(serializers.Serializer):
    """Serializer for top/bottom responses"""
    id = serializers.IntegerField()
    prompt = serializers.CharField()
    response = serializers.CharField()
    quality_score = serializers.FloatField(allow_null=True)
    user_feedback = serializers.CharField(allow_null=True)
    created_at = serializers.DateTimeField()

