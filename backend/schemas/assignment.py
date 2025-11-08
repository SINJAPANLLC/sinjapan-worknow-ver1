from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

from .base import PaginatedResponse, TimestampedModel


class AssignmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    PENDING_PICKUP = "pending_pickup"
    PICKING_UP = "picking_up"
    IN_DELIVERY = "in_delivery"
    DELIVERED = "delivered"


class AssignmentBase(TimestampedModel):
    job_id: str
    worker_id: str
    application_id: str
    status: AssignmentStatus = AssignmentStatus.ACTIVE
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = Field(default=None, max_length=2000)
    metadata: Optional[dict] = None
    pickup_location: Optional[str] = None
    delivery_location: Optional[str] = None
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    picked_up_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None


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
    pickup_location: Optional[str] = None
    delivery_location: Optional[str] = None
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    picked_up_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None


class AssignmentRead(AssignmentBase):
    id: str


class AssignmentList(PaginatedResponse[AssignmentRead]):
    pass
