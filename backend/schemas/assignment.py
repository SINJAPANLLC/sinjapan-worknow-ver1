from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

from .base import PaginatedResponse, TimestampedModel


class AssignmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class AssignmentBase(TimestampedModel):
    job_id: str
    worker_id: str
    application_id: str
    status: AssignmentStatus = AssignmentStatus.ACTIVE
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = Field(default=None, max_length=2000)
    metadata: Optional[dict] = None


class AssignmentCreate(BaseModel):
    application_id: str
    notes: Optional[str] = Field(default=None, max_length=2000)
    metadata: Optional[dict] = None


class AssignmentUpdate(BaseModel):
    status: Optional[AssignmentStatus] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = Field(default=None, max_length=2000)
    metadata: Optional[dict] = None


class AssignmentRead(AssignmentBase):
    id: str


class AssignmentList(PaginatedResponse[AssignmentRead]):
    pass
