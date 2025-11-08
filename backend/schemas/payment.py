from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from .base import PaginatedResponse, TimestampedModel


class PaymentStatus(str, Enum):
    REQUIRES_PAYMENT_METHOD = "requires_payment_method"
    REQUIRES_CONFIRMATION = "requires_confirmation"
    REQUIRES_ACTION = "requires_action"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    CANCELED = "canceled"


class PaymentBase(TimestampedModel):
    assignment_id: str
    amount: int = Field(..., ge=100)
    currency: str = Field(default="jpy", max_length=3)
    stripe_payment_intent_id: Optional[str] = None
    stripe_transfer_id: Optional[str] = None
    status: PaymentStatus = PaymentStatus.REQUIRES_PAYMENT_METHOD
    metadata: Optional[dict] = None


class PaymentCreate(BaseModel):
    assignment_id: str
    amount: int = Field(..., ge=100)
    currency: str = Field(default="jpy", max_length=3)


class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    stripe_payment_intent_id: Optional[str] = None
    stripe_transfer_id: Optional[str] = None
    metadata: Optional[dict] = None


class PaymentRead(PaymentBase):
    id: str


class PaymentList(PaginatedResponse[PaymentRead]):
    pass


class ConnectAccountRequest(BaseModel):
    email: EmailStr


class PaymentIntentCreateRequest(BaseModel):
    amount: int = Field(..., ge=100)
    worker_stripe_account: str
