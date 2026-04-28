import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from app.models.models import Item
from typing import List, Dict, Any
import uuid

logger = logging.getLogger(__name__)

class SimilarityService:
    async def find_similar_items(
        self, 
        session: AsyncSession, 
        template_id: uuid.UUID, 
        embedding: List[float], 
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        logger.info(f"Searching for similar items for template {template_id}")
        
        # Using cosine distance operator <-> for pgvector
        query = text("""
            SELECT content, embedding <-> :embedding AS distance
            FROM items
            WHERE template_id = :template_id
            ORDER BY distance ASC
            LIMIT :limit
        """)
        
        result = await session.execute(
            query, 
            {"embedding": str(embedding), "template_id": template_id, "limit": limit}
        )
        
        similar_items = [
            {"content": row[0], "score": float(row[1])} 
            for row in result.fetchall()
        ]
        
        logger.info(f"Found {len(similar_items)} similar items")
        return similar_items

similarity_service = SimilarityService()
