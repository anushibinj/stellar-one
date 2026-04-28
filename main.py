import logging
from fastapi import FastAPI
from app.api.endpoints import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(title="Stellar-One Semantic Generation Engine")

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Stellar-One API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
