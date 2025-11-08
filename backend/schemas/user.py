from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from .base import TimestampedModel


class UserRole(str, Enum):
    WORKER = "worker"
    COMPANY = "company"
    ADMIN = "admin"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class UserBase(TimestampedModel):
    email: EmailStr
    full_name: str
    role: UserRole
    avatar_url: Optional[str] = None
    is_active: bool = True
    phone: Optional[str] = None
    phone_verified: bool = False
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    work_style: Optional[str] = None
    affiliation: Optional[str] = None
    id_document_url: Optional[str] = None
    preferred_prefecture: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(..., max_length=100)
    role: UserRole


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=100)
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None
    phone: Optional[str] = None
    phone_verified: Optional[bool] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    work_style: Optional[str] = None
    affiliation: Optional[str] = None
    id_document_url: Optional[str] = None
    preferred_prefecture: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class UserRead(UserBase):
    id: str
