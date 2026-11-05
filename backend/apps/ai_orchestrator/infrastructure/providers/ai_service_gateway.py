"""
FastAPI AI service provider.

This adapter keeps the Django backend API-first: clients talk to Django, and
Django forwards AI requests to the dedicated ai_service.
"""
import json
from typing import AsyncIterator, Dict, Any

import aiohttp

from .base import BaseAIProvider
from ...domain.entities import AIRequest, AIResponse, AIProviderType
from ...domain.exceptions import AIProviderException


class AIServiceGatewayProvider(BaseAIProvider):
    """Provider adapter for the internal FastAPI ai_service."""

    def _chat_url(self) -> str:
        return f"{self.config.base_url.rstrip('/')}/api/v1/chat"

    def _stream_url(self) -> str:
        return f"{self._chat_url()}/stream"

    def _payload(self, request: AIRequest) -> dict[str, Any]:
        return {
            "message": request.prompt,
            "temperature": request.temperature,
            "system_prompt": request.system_prompt,
            "history": [
                {"role": message.role.value, "content": message.content}
                for message in request.conversation_history
            ],
        }

    async def _generate_implementation(self, request: AIRequest) -> AIResponse:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self._chat_url(), json=self._payload(request)) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise AIProviderException(
                            f"AI service error ({response.status}): {error_text}"
                        )

                    data = await response.json()
                    content = data.get("response") or data.get("message") or ""

                    if data.get("success") is False:
                        raise AIProviderException(content or "AI service returned an error")

                    return AIResponse(
                        content=content,
                        provider=AIProviderType.LOCAL,
                        model=self.config.model_name,
                        metadata=data,
                    )
        except aiohttp.ClientError as e:
            raise AIProviderException(f"AI service network error: {str(e)}")
        except json.JSONDecodeError as e:
            raise AIProviderException(f"Invalid AI service response: {str(e)}")

    async def _stream_implementation(self, request: AIRequest) -> AsyncIterator[str]:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self._stream_url(), json=self._payload(request)) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise AIProviderException(
                            f"AI service streaming error ({response.status}): {error_text}"
                        )

                    async for raw_line in response.content:
                        line = raw_line.decode("utf-8").strip()
                        if not line or not line.startswith("data:"):
                            continue

                        data_text = line.removeprefix("data:").strip()
                        if data_text == "[DONE]":
                            break

                        try:
                            data = json.loads(data_text)
                        except json.JSONDecodeError:
                            continue

                        if data.get("error"):
                            raise AIProviderException(data["error"])
                        if data.get("done"):
                            break
                        if data.get("chunk"):
                            yield data["chunk"]
                        elif data.get("content"):
                            yield data["content"]
        except aiohttp.ClientError as e:
            raise AIProviderException(f"AI service streaming network error: {str(e)}")

    async def _health_check_implementation(self) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.config.base_url.rstrip('/')}/health") as response:
                    return response.status == 200
        except Exception:
            return False

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "provider": "ai_service_gateway",
            "model": self.config.model_name,
            "base_url": self.config.base_url,
            "supports_streaming": True,
        }
