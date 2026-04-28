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
        self.llm = ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),  # fallback if not set
            base_url=os.getenv("OPENAI_BASE_URL"),
            api_key=os.getenv("OPENAI_API_KEY"),
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
