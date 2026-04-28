import logging
from typing import List
from langchain_openai import OpenAIEmbeddings
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            api_key=settings.OPENAI_API_KEY
        )

    async def embed_text(self, text: str) -> List[float]:
        logger.info("Starting embedding generation")
        embedding = await self.embeddings.aembed_query(text)
        logger.info("Embedding generation completed")
        return embedding

embedding_service = EmbeddingService()
