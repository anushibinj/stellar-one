import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.session import engine
from app.models.models import Base

async def init_db():
    async with engine.begin() as conn:
        # Enable pgvector extension
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        
        # Create tables
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("ALTER TABLE templates ADD COLUMN IF NOT EXISTS output_schema JSONB"))
        print("Database initialized successfully.")

if __name__ == "__main__":
    asyncio.run(init_db())
