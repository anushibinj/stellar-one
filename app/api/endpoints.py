from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.db.session import get_db
from app.models.models import Template, Item
from app.schemas.schemas import TemplateCreate, TemplateRead, GenerationResponse
from app.graph.stellar_graph import stellar_graph
from app.config import settings

router = APIRouter(tags=["Templates & Generation"])

@router.post("/templates", response_model=TemplateRead)
async def create_template(data: TemplateCreate, db: AsyncSession = Depends(get_db)):
    template = Template(name=data.name, system_prompt=data.system_prompt)
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template

@router.get("/templates", response_model=List[TemplateRead])
async def list_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Template))
    return result.scalars().all()

@router.post("/templates/{template_id}/generate", response_model=GenerationResponse)
async def generate_item(template_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    # Fetch template
    template = await db.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Run LangGraph workflow
    initial_state = {
        "template_id": template_id,
        "system_prompt": template.system_prompt,
        "candidate_content": None,
        "candidate_embedding": None,
        "similar_items": [],
        "attempts": 0,
        "max_retries": settings.MAX_RETRIES,
        "threshold": settings.SIMILARITY_THRESHOLD,
        "accepted": False,
        "db_session": db
    }
    
    final_state = await stellar_graph.ainvoke(initial_state)
    
    # Store the accepted item
    new_item = Item(
        template_id=template_id,
        content=final_state["candidate_content"],
        embedding=final_state["candidate_embedding"]
    )
    db.add(new_item)
    await db.commit()
    
    return {
        "content": final_state["candidate_content"],
        "attempts": final_state["attempts"],
        "similar_items": final_state["similar_items"]
    }
