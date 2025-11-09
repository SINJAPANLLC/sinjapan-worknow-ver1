from typing import Dict, Optional
from datetime import datetime

from fastapi import HTTPException, status

from schemas.client_settings import (
    NotificationPreferencesRead,
    NotificationPreferencesCreate,
    NotificationPreferencesUpdate,
    InvoiceSettingsRead,
    InvoiceSettingsCreate,
    InvoiceSettingsUpdate,
)

from .postgres_base import PostgresService


class ClientSettingsService(PostgresService):
    def __init__(self) -> None:
        super().__init__("client_notification_preferences")

    # Notification Preferences Methods
    def _to_notification_prefs(self, data: Dict) -> NotificationPreferencesRead:
        return NotificationPreferencesRead(**data)

    def get_notification_preferences(self, user_id: str) -> NotificationPreferencesRead:
        """Get notification preferences for a user, create with defaults if not exists"""
        with self._get_cursor() as cursor:
            cursor.execute(
                "SELECT * FROM client_notification_preferences WHERE user_id = %s LIMIT 1",
                (user_id,),
            )
            result = cursor.fetchone()
            if result:
                return self._to_notification_prefs(dict(result))
            
            # Create default preferences if not exists
            return self.create_notification_preferences(user_id, NotificationPreferencesCreate())

    def create_notification_preferences(
        self, user_id: str, payload: NotificationPreferencesCreate
    ) -> NotificationPreferencesRead:
        """Create notification preferences for a user"""
        with self._get_cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO client_notification_preferences 
                (user_id, push_enabled, email_enabled, job_applications, messages, system_notifications)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    user_id,
                    payload.push_enabled,
                    payload.email_enabled,
                    payload.job_applications,
                    payload.messages,
                    payload.system_notifications,
                ),
            )
            result = cursor.fetchone()
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create notification preferences",
                )
            return self._to_notification_prefs(dict(result))

    def update_notification_preferences(
        self, user_id: str, payload: NotificationPreferencesUpdate
    ) -> NotificationPreferencesRead:
        """Update notification preferences for a user"""
        update_data = payload.dict(exclude_unset=True)
        if not update_data:
            return self.get_notification_preferences(user_id)

        update_fields = []
        update_values = []
        for key, value in update_data.items():
            update_fields.append(f"{key} = %s")
            update_values.append(value)

        update_values.append(datetime.utcnow())
        update_values.append(user_id)

        with self._get_cursor() as cursor:
            cursor.execute(
                f"""
                UPDATE client_notification_preferences 
                SET {', '.join(update_fields)}, updated_at = %s
                WHERE user_id = %s
                RETURNING *
                """,
                tuple(update_values),
            )
            result = cursor.fetchone()
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Notification preferences not found",
                )
            return self._to_notification_prefs(dict(result))

    # Invoice Settings Methods
    def _to_invoice_settings(self, data: Dict) -> InvoiceSettingsRead:
        return InvoiceSettingsRead(**data)

    def get_invoice_settings(self, user_id: str) -> InvoiceSettingsRead:
        """Get invoice settings for a user, create with defaults if not exists"""
        with self._get_cursor() as cursor:
            cursor.execute(
                "SELECT * FROM client_invoice_settings WHERE user_id = %s LIMIT 1",
                (user_id,),
            )
            result = cursor.fetchone()
            if result:
                return self._to_invoice_settings(dict(result))
            
            # Create default settings if not exists
            return self.create_invoice_settings(user_id, InvoiceSettingsCreate())

    def create_invoice_settings(
        self, user_id: str, payload: InvoiceSettingsCreate
    ) -> InvoiceSettingsRead:
        """Create invoice settings for a user"""
        with self._get_cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO client_invoice_settings 
                (user_id, company_name, company_address, company_phone, tax_id)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    user_id,
                    payload.company_name,
                    payload.company_address,
                    payload.company_phone,
                    payload.tax_id,
                ),
            )
            result = cursor.fetchone()
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create invoice settings",
                )
            return self._to_invoice_settings(dict(result))

    def update_invoice_settings(
        self, user_id: str, payload: InvoiceSettingsUpdate
    ) -> InvoiceSettingsRead:
        """Update invoice settings for a user"""
        update_data = payload.dict(exclude_unset=True)
        if not update_data:
            return self.get_invoice_settings(user_id)

        update_fields = []
        update_values = []
        for key, value in update_data.items():
            update_fields.append(f"{key} = %s")
            update_values.append(value)

        update_values.append(datetime.utcnow())
        update_values.append(user_id)

        with self._get_cursor() as cursor:
            cursor.execute(
                f"""
                UPDATE client_invoice_settings 
                SET {', '.join(update_fields)}, updated_at = %s
                WHERE user_id = %s
                RETURNING *
                """,
                tuple(update_values),
            )
            result = cursor.fetchone()
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Invoice settings not found",
                )
            return self._to_invoice_settings(dict(result))
