from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
import uuid

from app.db.session import get_db
from app.models.models import Template, Item, ServedItem
from app.schemas.schemas import TemplateCreate, TemplateUpdate, TemplateRead, GenerationResponse, ItemRead, RandomItemRequest, RandomItemResponse
from app.graph.stellar_graph import stellar_graph
from app.config import settings

router = APIRouter(tags=["Templates & Generation"])

@router.post("/templates", response_model=TemplateRead, summary="Create a new template", description="Create a template with a name and system prompt to define the generation logic.")
async def create_template(data: TemplateCreate, db: AsyncSession = Depends(get_db)):
    template = Template(name=data.name, system_prompt=data.system_prompt, output_schema=data.output_schema)
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template

@router.get("/templates", response_model=List[TemplateRead], summary="List all templates", description="Retrieve a list of all existing generation templates.")
async def list_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Template))
    return result.scalars().all()

@router.put("/templates/{template_id}", response_model=TemplateRead, summary="Update a template", description="Update the name, system prompt and output schema of an existing template.")
async def update_template(template_id: uuid.UUID, data: TemplateUpdate, db: AsyncSession = Depends(get_db)):
    template = await db.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template.name = data.name
    template.system_prompt = data.system_prompt
    template.output_schema = data.output_schema
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

async def _generate_and_store(template: Template, db: AsyncSession):
    """Run the generation workflow for a template and persist the accepted item."""
    initial_state = {
        "template_id": template.id,
        "system_prompt": template.system_prompt,
        "output_schema": template.output_schema,
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

    new_item = Item(
        template_id=template.id,
        content=final_state["candidate_content"],
        embedding=final_state["candidate_embedding"]
    )
    db.add(new_item)
    await db.commit()
    return new_item, final_state

@router.post("/templates/{template_id}/generate", response_model=GenerationResponse, summary="Generate unique item", description="Trigger the semantic generation workflow to create a new item that is unique relative to existing items in this template.")
async def generate_item(template_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    # Fetch template
    template = await db.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    _, final_state = await _generate_and_store(template, db)

    return {
        "content": final_state["candidate_content"],
        "attempts": final_state["attempts"],
        "similar_items": final_state["similar_items"]
    }

@router.post("/templates/{template_id}/randomItem", response_model=RandomItemResponse, summary="Get a random item", description="Return a random existing item for the template. With a randomKey, items are never repeated for that key until every existing item has been served, after which new items are generated. Without a randomKey, a random existing item is returned statelessly (generating one if the template has none).")
async def random_item(template_id: uuid.UUID, data: Optional[RandomItemRequest] = Body(default=None), db: AsyncSession = Depends(get_db)):
    template = await db.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    random_key = data.random_key if data else None

    query = select(Item).where(Item.template_id == template_id)
    if random_key is not None:
        served = select(ServedItem.item_id).where(
            ServedItem.template_id == template_id, ServedItem.random_key == random_key
        )
        query = query.where(Item.id.not_in(served))
    query = query.order_by(func.random()).limit(1)

    # A concurrent request with the same key may claim the item first; retry with a fresh pick.
    for _ in range(5):
        item = (await db.execute(query)).scalars().first()
        if item is None:
            break
        if random_key is None:
            return {"id": item.id, "content": item.content, "generated": False}
        db.add(ServedItem(template_id=template_id, random_key=random_key, item_id=item.id))
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            continue
        return {"id": item.id, "content": item.content, "generated": False}

    # No unserved items left: generate a new one with the existing logic
    new_item, _ = await _generate_and_store(template, db)
    if random_key is not None:
        db.add(ServedItem(template_id=template_id, random_key=random_key, item_id=new_item.id))
        await db.commit()
    return {"id": new_item.id, "content": new_item.content, "generated": True}

@router.get("/templates/{template_id}/items", response_model=List[ItemRead], summary="List items by template", description="Retrieve all generated items belonging to a specific template.")
async def list_template_items(template_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.template_id == template_id).order_by(Item.created_at.desc()))
    return result.scalars().all()

@router.get("/items", response_model=List[ItemRead], summary="List all items", description="Retrieve a list of all generated items across all templates.")
async def list_all_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).order_by(Item.created_at.desc()))
    return result.scalars().all()

@router.delete("/templates/{template_id}/items/{item_id}", summary="Delete an item", description="Delete a single generated item from a template's history.")
async def delete_template_item(template_id: uuid.UUID, item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    item = await db.get(Item, item_id)
    if not item or item.template_id != template_id:
        raise HTTPException(status_code=404, detail="Item not found")

    await db.delete(item)
    await db.commit()
    return {"message": "Item deleted successfully"}
