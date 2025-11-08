from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ActivityLogBase(BaseModel):
    user_id: str
    action_type: str = Field(..., max_length=50)
    entity_type: Optional[str] = Field(default=None, max_length=50)
    entity_id: Optional[str] = None
    description: str = Field(..., max_length=500)
    metadata: Optional[dict] = None
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime


class ActivityLogCreate(BaseModel):
    action_type: str = Field(..., max_length=50)
    entity_type: Optional[str] = Field(default=None, max_length=50)
    entity_id: Optional[str] = None
    description: str = Field(..., max_length=500)
    metadata: Optional[dict] = None


class ActivityLog(ActivityLogBase):
    id: str

    class Config:
        from_attributes = True
