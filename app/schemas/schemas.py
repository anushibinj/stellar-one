import jsonschema
from pydantic import BaseModel, ConfigDict, Field, field_validator
from uuid import UUID
from datetime import datetime
from typing import Any, Dict, List, Optional

def _validate_output_schema(schema: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Empty means unconstrained; anything else must be a valid JSON Schema."""
    if not schema:
        return None
    try:
        jsonschema.Draft202012Validator.check_schema(schema)
    except jsonschema.SchemaError as e:
        raise ValueError(f"Invalid JSON Schema: {e.message}")
    return schema

class TemplateCreate(BaseModel):
    name: str
    system_prompt: str
    output_schema: Optional[Dict[str, Any]] = None

    _check_schema = field_validator("output_schema")(_validate_output_schema)

class TemplateUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    system_prompt: str = Field(min_length=1)
    output_schema: Optional[Dict[str, Any]] = None

    _check_schema = field_validator("output_schema")(_validate_output_schema)

class TemplateRead(BaseModel):
    id: UUID
    name: str
    system_prompt: str
    output_schema: Optional[Dict[str, Any]] = None
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
