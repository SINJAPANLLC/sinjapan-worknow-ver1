from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel

from .base import PaginatedResponse, TimestampedModel


class NotificationType(str, Enum):
    APPLICATION = "application"
    ASSIGNMENT = "assignment"
    PAYMENT = "payment"
    SYSTEM = "system"


class NotificationBase(TimestampedModel):
    user_id: str
    type: NotificationType
    title: str
    body: str
    data: Optional[dict] = None
    read_at: Optional[datetime] = None


class NotificationCreate(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    body: str
    data: Optional[dict] = None


class NotificationUpdate(BaseModel):
    read: bool | None = None


class NotificationRead(NotificationBase):
    id: str


class NotificationList(PaginatedResponse[NotificationRead]):
    pass


class DeviceTokenCreate(BaseModel):
    user_id: str
    token: str
    platform: str


class DeviceTokenRead(BaseModel):
    id: str
    user_id: str
    token: str
    platform: str
    created_at: datetime | None = None
