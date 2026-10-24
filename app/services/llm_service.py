import logging
import os
from typing import Any, Dict, Optional, Tuple
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings
from app.services.token_usage import chat_usage_from_message
from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        base_url = os.getenv("OPENAI_BASE_URL") or None  # empty string -> default OpenAI endpoint
        # Self-hosted OpenAI-compatible servers (e.g. Ollama) need no key, but the client requires a non-empty one.
        api_key = os.getenv("OPENAI_API_KEY") or ("not-needed" if base_url else None)
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # fallback if not set
        self.llm = ChatOpenAI(
            model=self.model,
            base_url=base_url,
            api_key=api_key,
            timeout=settings.OLLAMA_TIMEOUT,
        )

    async def generate_text(self, system_prompt: str, user_prompt: str, output_schema: Optional[Dict[str, Any]] = None) -> str:
        content, _ = await self.generate_text_with_usage(system_prompt, user_prompt, output_schema)
        return content

    async def generate_text_with_usage(self, system_prompt: str, user_prompt: str, output_schema: Optional[Dict[str, Any]] = None) -> Tuple[str, Optional[Dict[str, int]]]:
        """Returns (content, token_usage). token_usage is None when the provider reported none."""
        logger.info("Starting LLM generation")
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        llm = self.llm
        if output_schema:
            # Constrained decoding: Ollama (and OpenAI) enforce the schema on the sampled tokens
            llm = self.llm.bind(response_format={
                "type": "json_schema",
                "json_schema": {"name": "output", "schema": output_schema, "strict": True},
            })
        response = await llm.ainvoke(messages)
        logger.info("LLM generation completed")
        return response.content, chat_usage_from_message(response)

llm_service = LLMService()
