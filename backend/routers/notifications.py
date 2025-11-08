from fastapi import APIRouter, Depends, HTTPException, Query, status

from dependencies import get_current_user
from schemas import (
    DeviceTokenCreate,
    DeviceTokenRead,
    NotificationCreate,
    NotificationList,
    NotificationRead,
    NotificationUpdate,
    UserRead,
)
from services.notification_service import NotificationService

router = APIRouter()


def get_notification_service() -> NotificationService:
    return NotificationService()


@router.get("/", response_model=NotificationList)
async def list_notifications(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: UserRead = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
) -> NotificationList:
    return notification_service.list_notifications(current_user.id, page=page, size=size)


@router.post("/", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
async def create_notification(
    payload: NotificationCreate,
    notification_service: NotificationService = Depends(get_notification_service),
) -> NotificationRead:
    return notification_service.create_notification(payload)


@router.patch("/{notification_id}", response_model=NotificationRead)
async def mark_notification(
    notification_id: str,
    payload: NotificationUpdate,
    current_user: UserRead = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
) -> NotificationRead:
    notification = notification_service.get_notification(notification_id)
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return notification_service.update_notification(notification_id, payload)


@router.post("/token", response_model=DeviceTokenRead)
async def register_token(
    payload: DeviceTokenCreate,
    current_user: UserRead = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
) -> DeviceTokenRead:
    if payload.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return notification_service.register_token(payload)
