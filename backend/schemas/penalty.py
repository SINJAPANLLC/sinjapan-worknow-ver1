from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

from .base import TimestampedModel


class PenaltyType(str, Enum):
    WARNING = "warning"
    SUSPENSION = "suspension"
    BAN = "ban"


class PenaltyBase(TimestampedModel):
    user_id: str
    type: PenaltyType
    reason: str
    description: Optional[str] = None
    penalty_points: int = 0
    issued_by: Optional[str] = None
    issued_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    is_active: bool = True


class PenaltyCreate(BaseModel):
    user_id: str
    type: PenaltyType
    reason: str
    description: Optional[str] = None
    penalty_points: int = 0
    expires_at: Optional[datetime] = None


class PenaltyRead(PenaltyBase):
    id: str


class PenaltyList(BaseModel):
    items: list[PenaltyRead]
    total: int
