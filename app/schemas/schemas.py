from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime
from typing import List, Optional

class TemplateCreate(BaseModel):
    name: str
    system_prompt: str

class TemplateUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    system_prompt: str = Field(min_length=1)

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

class ItemRead(BaseModel):
    id: UUID
    template_id: UUID
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RandomItemRequest(BaseModel):
    random_key: Optional[str] = Field(default=None, alias="randomKey", max_length=255)

    model_config = ConfigDict(populate_by_name=True)

class RandomItemResponse(BaseModel):
    id: UUID
    content: str
    generated: bool
