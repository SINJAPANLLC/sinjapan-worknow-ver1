from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from .base import TimestampedModel


class WithdrawalStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    REJECTED = "rejected"


class WithdrawalRequestBase(TimestampedModel):
    user_id: str
    bank_account_id: str
    amount: int = Field(..., ge=100)
    currency: str = Field(default="JPY", max_length=3)
    status: WithdrawalStatus = WithdrawalStatus.PENDING
    processed_at: Optional[datetime] = None
    notes: Optional[str] = Field(default=None, max_length=500)
    admin_notes: Optional[str] = Field(default=None, max_length=500)
    metadata: Optional[dict] = None


class WithdrawalRequestCreate(BaseModel):
    bank_account_id: str
    amount: int = Field(..., ge=100)
    notes: Optional[str] = Field(default=None, max_length=500)


class WithdrawalRequestUpdate(BaseModel):
    status: Optional[WithdrawalStatus] = None
    admin_notes: Optional[str] = Field(default=None, max_length=500)


class WithdrawalRequest(WithdrawalRequestBase):
    id: str

    class Config:
        from_attributes = True
