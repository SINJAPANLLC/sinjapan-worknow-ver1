from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from .base import TimestampedModel


class UserRole(str, Enum):
    WORKER = "worker"
    COMPANY = "company"
    ADMIN = "admin"


class UserBase(TimestampedModel):
    email: EmailStr
    full_name: str
    role: UserRole
    avatar_url: Optional[str] = None
    is_active: bool = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(..., max_length=100)
    role: UserRole


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=100)
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None


class UserRead(UserBase):
    id: str
