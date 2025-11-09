from fastapi import APIRouter, Depends

from dependencies import get_current_user, require_role
from schemas import UserRead, UserRole
from schemas.client_settings import (
    NotificationPreferencesRead,
    NotificationPreferencesUpdate,
    InvoiceSettingsRead,
    InvoiceSettingsUpdate,
)
from services.client_settings_service import ClientSettingsService

router = APIRouter()


def get_client_settings_service() -> ClientSettingsService:
    return ClientSettingsService()


@router.get("/notifications", response_model=NotificationPreferencesRead)
async def get_notification_preferences(
    current_user: UserRead = Depends(require_role(UserRole.COMPANY)),
    settings_service: ClientSettingsService = Depends(get_client_settings_service),
):
    """Get notification preferences for the current client user"""
    return settings_service.get_notification_preferences(current_user.id)


@router.put("/notifications", response_model=NotificationPreferencesRead)
async def update_notification_preferences(
    payload: NotificationPreferencesUpdate,
    current_user: UserRead = Depends(require_role(UserRole.COMPANY)),
    settings_service: ClientSettingsService = Depends(get_client_settings_service),
):
    """Update notification preferences for the current client user"""
    return settings_service.update_notification_preferences(current_user.id, payload)


@router.get("/invoice", response_model=InvoiceSettingsRead)
async def get_invoice_settings(
    current_user: UserRead = Depends(require_role(UserRole.COMPANY)),
    settings_service: ClientSettingsService = Depends(get_client_settings_service),
):
    """Get invoice settings for the current client user"""
    return settings_service.get_invoice_settings(current_user.id)


@router.put("/invoice", response_model=InvoiceSettingsRead)
async def update_invoice_settings(
    payload: InvoiceSettingsUpdate,
    current_user: UserRead = Depends(require_role(UserRole.COMPANY)),
    settings_service: ClientSettingsService = Depends(get_client_settings_service),
):
    """Update invoice settings for the current client user"""
    return settings_service.update_invoice_settings(current_user.id, payload)
