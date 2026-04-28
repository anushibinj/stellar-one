import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine
from app.models.models import Base
from scripts.init_db import init_db

async def reset_db():
    print("Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    print("Re-initializing database...")
    await init_db()
    print("Database reset successfully.")

if __name__ == "__main__":
    asyncio.run(reset_db())
