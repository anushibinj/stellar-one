import logging
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings
from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        base_url = os.getenv("OPENAI_BASE_URL") or None  # empty string -> default OpenAI endpoint
        # Self-hosted OpenAI-compatible servers (e.g. Ollama) need no key, but the client requires a non-empty one.
        api_key = os.getenv("OPENAI_API_KEY") or ("not-needed" if base_url else None)
        self.llm = ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),  # fallback if not set
            base_url=base_url,
            api_key=api_key,
        )

    async def generate_text(self, system_prompt: str, user_prompt: str) -> str:
        logger.info("Starting LLM generation")
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        response = await self.llm.ainvoke(messages)
        logger.info("LLM generation completed")
        return response.content

llm_service = LLMService()
