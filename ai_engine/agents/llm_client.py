"""
LiteLLM unified AI client — routes to Gemini / Groq / NVIDIA with fallbacks.
Free tier priority. Falls back to rule-based when no API keys available.
"""
import asyncio
import logging
import os
import time
from typing import Optional

log = logging.getLogger("llm_client")

# Try LiteLLM
try:
    import litellm
    litellm.set_verbose = False
    LITELLM_AVAILABLE = True
except ImportError:
    LITELLM_AVAILABLE = False
    log.debug("litellm not installed — using direct provider clients")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Model routing: free tiers first, in priority order
_MODEL_PRIORITY = []
if GEMINI_API_KEY:
    _MODEL_PRIORITY.append(("gemini/gemini-1.5-flash", GEMINI_API_KEY))
if GROQ_API_KEY:
    _MODEL_PRIORITY.append(("groq/llama-3.1-8b-instant", GROQ_API_KEY))
if NVIDIA_API_KEY:
    _MODEL_PRIORITY.append(("nvidia_nim/meta/llama-3.1-8b-instruct", NVIDIA_API_KEY))


class LiteLLMClient:
    """
    Unified LLM client using LiteLLM for provider abstraction.
    Supports Gemini Flash, Groq Llama, NVIDIA NIM — all free tiers.
    """

    def __init__(self):
        self.available = LITELLM_AVAILABLE and len(_MODEL_PRIORITY) > 0
        self._last_call = 0.0
        self._min_interval = 4.1  # ~15 RPM safe rate

        if self.available:
            models = [m[0] for m in _MODEL_PRIORITY]
            log.info(f"✅ LiteLLM ready — providers: {models}")
        else:
            log.info("LiteLLM unavailable — rule-based fallback active")

    async def generate(self, prompt: str, max_tokens: int = 200) -> Optional[str]:
        if not self.available:
            return None

        elapsed = time.time() - self._last_call
        if elapsed < self._min_interval:
            await asyncio.sleep(self._min_interval - elapsed)
        self._last_call = time.time()

        for model, api_key in _MODEL_PRIORITY:
            try:
                response = await asyncio.to_thread(
                    litellm.completion,
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=max_tokens,
                    temperature=0.3,
                    api_key=api_key,
                )
                text = response.choices[0].message.content
                if text:
                    return text.strip()
            except Exception as e:
                log.warning(f"LiteLLM {model} failed: {e}")
                continue

        return None

    @property
    def provider_name(self) -> str:
        if not self.available or not _MODEL_PRIORITY:
            return "rule-based"
        return _MODEL_PRIORITY[0][0].split("/")[0]


# Singleton used across agents
llm_client = LiteLLMClient()
