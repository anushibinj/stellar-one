import logging
import httpx
from typing import List
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.EMBEDDING_MODEL

    async def embed_text(self, text: str) -> List[float]:
        logger.info(f"Starting embedding generation with Ollama model: {self.model}")
        
        url = f"{self.base_url}/api/embeddings"
        payload = {
            "model": self.model,
            "prompt": text
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                
                data = response.json()
                if "embedding" not in data:
                    logger.error(f"Invalid response from Ollama: {data}")
                    raise ValueError("Response from Ollama does not contain 'embedding'")
                
                logger.info("Embedding generation completed")
                return data["embedding"]
                
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
