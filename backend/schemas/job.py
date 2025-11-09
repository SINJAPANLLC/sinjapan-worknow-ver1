from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

from .base import PaginatedResponse, TimestampedModel


class JobStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"


class JobBase(TimestampedModel):
    title: str = Field(..., max_length=120)
    description: str = Field(..., max_length=2000)
    company_id: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    hourly_rate: Optional[int] = Field(default=None, ge=0)
    currency: str = Field(default="JPY", max_length=3)
    status: JobStatus = JobStatus.DRAFT
    tags: List[str] = []
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    prefecture: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_urgent: bool = False
    urgent_deadline: Optional[datetime] = None


class JobCreate(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    hourly_rate: Optional[int] = Field(default=None, ge=0)
    currency: str = Field(default="JPY", max_length=3)
    tags: List[str] = []
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    prefecture: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_urgent: bool = False
    urgent_deadline: Optional[datetime] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    hourly_rate: Optional[int] = Field(default=None, ge=0)
    currency: Optional[str] = Field(default=None, max_length=3)
    status: Optional[JobStatus] = None
    tags: Optional[List[str]] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    prefecture: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_urgent: Optional[bool] = None
    urgent_deadline: Optional[datetime] = None


class JobRead(JobBase):
    id: str
    company_name: Optional[str] = None


class JobList(PaginatedResponse[JobRead]):
    pass
