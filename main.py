import logging
from fastapi import FastAPI
from app.api.endpoints import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(
    title="Stellar-One Semantic Generation Engine",
    description="A semantic uniqueness generation engine using FastAPI, pgvector, and LangGraph.",
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Stellar-One API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
