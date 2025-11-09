from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

from .base import PaginatedResponse, TimestampedModel


class ApplicationStatus(str, Enum):
    PENDING = "pending"
    INTERVIEW = "interview"
    HIRED = "hired"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class JobSummary(BaseModel):
    title: str
    company_name: str
    company_id: str


class ApplicationBase(TimestampedModel):
    job_id: str
    worker_id: str
    cover_letter: Optional[str] = Field(default=None, max_length=4000)
    status: ApplicationStatus = ApplicationStatus.PENDING


class ApplicationCreate(BaseModel):
    job_id: str
    cover_letter: Optional[str] = Field(default=None, max_length=4000)


class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    cover_letter: Optional[str] = Field(default=None, max_length=4000)


class ApplicationRead(ApplicationBase):
    id: str
    job: Optional[JobSummary] = None


class ApplicationList(PaginatedResponse[ApplicationRead]):
    pass
