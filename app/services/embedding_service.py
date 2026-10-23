import logging
import httpx
from typing import List
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.base_url = (settings.EMBEDDING_BASE_URL or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = settings.EMBEDDING_MODEL
        self.openai_style = settings.EMBEDDING_API_STYLE.lower() == "openai"
        self.headers = {"Authorization": f"Bearer {settings.EMBEDDING_API_KEY}"} if settings.EMBEDDING_API_KEY else {}

    async def embed_text(self, text: str) -> List[float]:
        logger.info(f"Starting embedding generation with model: {self.model} at {self.base_url}")

        if self.openai_style:
            url = f"{self.base_url}/embeddings"
            payload = {"model": self.model, "input": text}
        else:
            url = f"{self.base_url}/api/embeddings"
            payload = {"model": self.model, "prompt": text}

        try:
            async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT) as client:
                response = await client.post(url, json=payload, headers=self.headers)
                response.raise_for_status()

                data = response.json()
                if self.openai_style:
                    embedding = (data.get("data") or [{}])[0].get("embedding")
                else:
                    embedding = data.get("embedding")
                if not embedding:
                    logger.error(f"Invalid response from embedding endpoint: {data}")
                    raise ValueError("Response from embedding endpoint does not contain an embedding")

                logger.info("Embedding generation completed")
                return embedding
                
        except httpx.ConnectError:
            logger.error(f"Failed to connect to Ollama at {self.base_url}. Is it running?")
            raise
        except httpx.HTTPStatusError as e:
            logger.error(f"Ollama returned an error status: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during embedding generation: {str(e)}")
            raise

embedding_service = EmbeddingService()
