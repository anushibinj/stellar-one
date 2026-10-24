import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api.endpoints import router as api_router
from app.db.session import engine
from app.models.models import Base

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

@asynccontextmanager
async def lifespan(_: FastAPI):
    # Ensure the pgvector extension and all tables exist (no-op if already present)
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
        # create_all doesn't alter existing tables; add columns introduced after the first release
        await conn.execute(text("ALTER TABLE templates ADD COLUMN IF NOT EXISTS output_schema JSONB"))
        await conn.execute(text("ALTER TABLE items ADD COLUMN IF NOT EXISTS chat_model VARCHAR(255)"))
        await conn.execute(text("ALTER TABLE items ADD COLUMN IF NOT EXISTS embedding_model VARCHAR(255)"))
        await conn.execute(text("ALTER TABLE items ADD COLUMN IF NOT EXISTS token_usage JSONB"))
    yield


app = FastAPI(
    lifespan=lifespan,
    title="Stellar-One Semantic Generation Engine",
    description="A semantic uniqueness generation engine using FastAPI, pgvector, and LangGraph.",
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # Echo the request origin so credentialed requests also work (a literal "*" is rejected by browsers)
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Stellar-One API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
