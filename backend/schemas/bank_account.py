from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from .base import TimestampedModel


class AccountType(str, Enum):
    ORDINARY = "ordinary"
    CURRENT = "current"


class BankAccountBase(TimestampedModel):
    user_id: str
    bank_name: str = Field(..., max_length=100)
    bank_code: Optional[str] = Field(default=None, max_length=10)
    branch_name: str = Field(..., max_length=100)
    branch_code: Optional[str] = Field(default=None, max_length=10)
    account_type: AccountType
    account_number: str = Field(..., max_length=20)
    account_holder_name: str = Field(..., max_length=100)
    is_default: bool = False


class BankAccountCreate(BaseModel):
    bank_name: str = Field(..., max_length=100)
    bank_code: Optional[str] = Field(default=None, max_length=10)
    branch_name: str = Field(..., max_length=100)
    branch_code: Optional[str] = Field(default=None, max_length=10)
    account_type: AccountType
    account_number: str = Field(..., max_length=20)
    account_holder_name: str = Field(..., max_length=100)
    is_default: bool = False


class BankAccountUpdate(BaseModel):
    bank_name: Optional[str] = Field(default=None, max_length=100)
    bank_code: Optional[str] = Field(default=None, max_length=10)
    branch_name: Optional[str] = Field(default=None, max_length=100)
    branch_code: Optional[str] = Field(default=None, max_length=10)
    account_type: Optional[AccountType] = None
    account_number: Optional[str] = Field(default=None, max_length=20)
    account_holder_name: Optional[str] = Field(default=None, max_length=100)
    is_default: Optional[bool] = None


class BankAccount(BankAccountBase):
    id: str

    class Config:
        from_attributes = True
