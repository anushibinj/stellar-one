from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional

class TemplateCreate(BaseModel):
    name: str
    system_prompt: str

class TemplateRead(BaseModel):
    id: UUID
    name: str
    system_prompt: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SimilarItem(BaseModel):
    content: str
    score: float

class GenerationResponse(BaseModel):
    content: str
    attempts: int
    similar_items: List[SimilarItem]
