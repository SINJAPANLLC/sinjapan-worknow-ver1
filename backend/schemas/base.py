from datetime import datetime
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field


ModelT = TypeVar("ModelT")


class TimestampedModel(BaseModel):
    created_at: Optional[datetime] = Field(default=None, description="作成日時")
    updated_at: Optional[datetime] = Field(default=None, description="更新日時")


class PaginatedResponse(BaseModel, Generic[ModelT]):
    items: List[ModelT]
    total: int
    page: int
    size: int


class MessageResponse(BaseModel):
    message: str


class IdResponse(BaseModel):
    id: str
