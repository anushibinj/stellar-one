from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/stellar_one"
    OPENAI_API_KEY: str = "" # Now optional as we use Ollama for embeddings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # Generation settings
    MAX_RETRIES: int = 5
    SIMILARITY_THRESHOLD: float = 0.30  # Cosine distance: lower means more similar
    EMBEDDING_MODEL: str = "nomic-embed-text"
    LLM_MODEL: str = "gpt-4o-mini"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
