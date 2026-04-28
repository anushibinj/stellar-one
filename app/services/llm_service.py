import logging
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            api_key=settings.OPENAI_API_KEY,
            temperature=0.7
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
