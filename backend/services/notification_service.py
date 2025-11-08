from datetime import datetime
from typing import Dict

from fastapi import HTTPException, status

from schemas import (
    DeviceTokenCreate,
    DeviceTokenRead,
    NotificationCreate,
    NotificationList,
    NotificationRead,
    NotificationUpdate,
)
from utils.firebase import send_push_notification

from .postgres_base import PostgresService


class NotificationService(PostgresService):
    def __init__(self) -> None:
        super().__init__("notifications")
        self.tokens = PostgresService("device_tokens")

    def _to_notification(self, data: Dict) -> NotificationRead:
        return NotificationRead(**data)

    def _to_token(self, data: Dict) -> DeviceTokenRead:
        return DeviceTokenRead(**data)

    def get_notification(self, notification_id: str) -> NotificationRead:
        data = self.get_by_id(notification_id)
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        return self._to_notification(data)

    def create_notification(self, payload: NotificationCreate, *, push: bool = True) -> NotificationRead:
        record = payload.dict()
        created = self.insert(record)
        notification = self._to_notification(created)
        if push:
            self._push_notification(notification)
        return notification

    def list_notifications(
        self,
        user_id: str,
        page: int = 1,
        size: int = 20,
    ) -> NotificationList:
        start = (page - 1) * size
        end = start + size - 1
        response = self.list(
            filters={"user_id": user_id},
            range_=(start, end),
            order=("created_at", "desc"),
        )
        items = [self._to_notification(item) for item in response["items"]]
        total = response["count"]
        return NotificationList(items=items, total=total, page=page, size=size)

    def update_notification(self, notification_id: str, payload: NotificationUpdate) -> NotificationRead:
        update_data: Dict = {}
        if payload.read is not None:
            update_data["read_at"] = datetime.utcnow().isoformat() if payload.read else None
        updated = self.update(notification_id, update_data)
        return self._to_notification(updated)

    def register_token(self, payload: DeviceTokenCreate) -> DeviceTokenRead:
        with self.tokens._get_cursor() as cursor:
            cursor.execute(
                "SELECT * FROM device_tokens WHERE token = %s LIMIT 1",
                (payload.token,)
            )
            existing = cursor.fetchone()
            if existing:
                record = self.tokens.update(existing["id"], payload.dict())
            else:
                record = self.tokens.insert(payload.dict())
        return self._to_token(record)

    def _push_notification(self, notification: NotificationRead) -> None:
        with self.tokens._get_cursor() as cursor:
            cursor.execute(
                "SELECT token FROM device_tokens WHERE user_id = %s",
                (notification.user_id,)
            )
            tokens = [row["token"] for row in cursor.fetchall()]
        for token in tokens:
            send_push_notification(
                token=token,
                title=notification.title,
                body=notification.body,
                data={"type": notification.type.value, **(notification.data or {})},
            )
