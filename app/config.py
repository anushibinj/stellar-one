from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/stellar_one"
    OPENAI_API_KEY: str = "" # Now optional as we use Ollama for embeddings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # Seconds to wait on Ollama (LLM + embeddings) before giving up; local models can be slow
    OLLAMA_TIMEOUT: float = 600.0

    # Generation settings
    MAX_RETRIES: int = 5
    SIMILARITY_THRESHOLD: float = 0.30  # Cosine distance: lower means more similar
    EMBEDDING_MODEL: str = "nomic-embed-text"
    # Embedding endpoint, independent of the chat endpoint (OPENAI_BASE_URL). Empty falls back to OLLAMA_BASE_URL.
    EMBEDDING_BASE_URL: str = ""
    EMBEDDING_API_KEY: str = ""
    # "ollama" -> POST {base}/api/embeddings; "openai" -> POST {base}/embeddings (OpenAI-compatible, base includes /v1)
    EMBEDDING_API_STYLE: str = "ollama"
    LLM_MODEL: str = "gpt-4o-mini"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
