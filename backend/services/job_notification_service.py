from typing import Optional, Dict, Any
from datetime import date
import logging

from fastapi import HTTPException, status

from .postgres_base import PostgresService


logger = logging.getLogger(__name__)


class JobNotificationService(PostgresService):
    def __init__(self) -> None:
        super().__init__("job_notifications")
    
    def set_job_notification(
        self,
        user_id: str,
        target_date: Optional[date] = None,
        prefecture: Optional[str] = None,
        enabled: bool = True
    ) -> Dict[str, Any]:
        """Set or update job notification preferences"""
        try:
            with self._get_cursor() as cursor:
                query = """
                    INSERT INTO job_notifications (user_id, target_date, prefecture, enabled)
                    VALUES (%s::uuid, %s, %s, %s)
                    ON CONFLICT (user_id, target_date, prefecture)
                    DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = CURRENT_TIMESTAMP
                    RETURNING id, user_id, target_date, prefecture, enabled, created_at, updated_at
                """
                cursor.execute(query, (user_id, target_date, prefecture, enabled))
                result = cursor.fetchone()
                return dict(result) if result else {}
        except Exception as e:
            logger.error(f"Error setting notification: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to set notification preference"
            )
    
    def get_notification(
        self,
        user_id: str,
        target_date: Optional[date] = None,
        prefecture: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get job notification preference"""
        try:
            with self._get_cursor() as cursor:
                query = """
                    SELECT * FROM job_notifications
                    WHERE user_id = %s::uuid
                    AND (target_date = %s OR (%s IS NULL AND target_date IS NULL))
                    AND (prefecture = %s OR (%s IS NULL AND prefecture IS NULL))
                """
                cursor.execute(query, (user_id, target_date, target_date, prefecture, prefecture))
                result = cursor.fetchone()
                return dict(result) if result else None
        except Exception as e:
            logger.error(f"Error getting notification: {e}")
            return None
