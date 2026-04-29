from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.db.session import get_db
from app.models.models import Template, Item
from app.schemas.schemas import TemplateCreate, TemplateRead, GenerationResponse, ItemRead
from app.graph.stellar_graph import stellar_graph
from app.config import settings

router = APIRouter(tags=["Templates & Generation"])

@router.post("/templates", response_model=TemplateRead, summary="Create a new template", description="Create a template with a name and system prompt to define the generation logic.")
async def create_template(data: TemplateCreate, db: AsyncSession = Depends(get_db)):
    template = Template(name=data.name, system_prompt=data.system_prompt)
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template

@router.get("/templates", response_model=List[TemplateRead], summary="List all templates", description="Retrieve a list of all existing generation templates.")
async def list_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Template))
    return result.scalars().all()

@router.put("/templates/{template_id}", response_model=TemplateRead, summary="Update a template", description="Update the name and system prompt of an existing template.")
async def update_template(template_id: uuid.UUID, data: TemplateCreate, db: AsyncSession = Depends(get_db)):
    template = await db.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template.name = data.name
    template.system_prompt = data.system_prompt
    await db.commit()
    await db.refresh(template)
    return template

@router.delete("/templates/{template_id}", summary="Delete a template", description="Delete a template and all its associated generated items.")
async def delete_template(template_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    template = await db.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    await db.delete(template)
    await db.commit()
    return {"message": "Template deleted successfully"}

@router.post("/templates/{template_id}/generate", response_model=GenerationResponse, summary="Generate unique item", description="Trigger the semantic generation workflow to create a new item that is unique relative to existing items in this template.")
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

@router.get("/templates/{template_id}/items", response_model=List[ItemRead], summary="List items by template", description="Retrieve all generated items belonging to a specific template.")
async def list_template_items(template_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.template_id == template_id).order_by(Item.created_at.desc()))
    return result.scalars().all()

@router.get("/items", response_model=List[ItemRead], summary="List all items", description="Retrieve a list of all generated items across all templates.")
async def list_all_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).order_by(Item.created_at.desc()))
    return result.scalars().all()
