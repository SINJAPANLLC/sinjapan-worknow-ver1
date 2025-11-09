from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationPreferencesBase(BaseModel):
    push_enabled: bool = True
    email_enabled: bool = True
    job_applications: bool = True
    messages: bool = True
    system_notifications: bool = True


class NotificationPreferencesCreate(NotificationPreferencesBase):
    pass


class NotificationPreferencesUpdate(BaseModel):
    push_enabled: Optional[bool] = None
    email_enabled: Optional[bool] = None
    job_applications: Optional[bool] = None
    messages: Optional[bool] = None
    system_notifications: Optional[bool] = None


class NotificationPreferencesRead(NotificationPreferencesBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InvoiceSettingsBase(BaseModel):
    company_name: Optional[str] = None
    company_address: Optional[str] = None
    company_phone: Optional[str] = None
    tax_id: Optional[str] = None


class InvoiceSettingsCreate(InvoiceSettingsBase):
    pass


class InvoiceSettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    company_address: Optional[str] = None
    company_phone: Optional[str] = None
    tax_id: Optional[str] = None


class InvoiceSettingsRead(InvoiceSettingsBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
