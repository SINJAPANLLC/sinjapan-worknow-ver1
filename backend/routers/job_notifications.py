from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from dependencies import get_current_user
from schemas import UserRead
from services.job_notification_service import JobNotificationService


router = APIRouter()


class NotificationRequest(BaseModel):
    target_date: Optional[str] = None
    prefecture: Optional[str] = None
    enabled: bool = True


class NotificationResponse(BaseModel):
    enabled: bool
    target_date: Optional[str] = None
    prefecture: Optional[str] = None


def get_notification_service() -> JobNotificationService:
    return JobNotificationService()


@router.post("/", response_model=NotificationResponse)
def set_notification(
    payload: NotificationRequest,
    current_user: UserRead = Depends(get_current_user),
    notification_service: JobNotificationService = Depends(get_notification_service),
) -> NotificationResponse:
    """Set job notification preference"""
    target_date_obj = date.fromisoformat(payload.target_date) if payload.target_date else None
    
    notification_service.set_job_notification(
        user_id=current_user.id,
        target_date=target_date_obj,
        prefecture=payload.prefecture,
        enabled=payload.enabled
    )
    
    return NotificationResponse(
        enabled=payload.enabled,
        target_date=payload.target_date,
        prefecture=payload.prefecture
    )


@router.get("/", response_model=NotificationResponse)
def get_notification(
    target_date: Optional[str] = None,
    prefecture: Optional[str] = None,
    current_user: UserRead = Depends(get_current_user),
    notification_service: JobNotificationService = Depends(get_notification_service),
) -> NotificationResponse:
    """Get job notification preference"""
    target_date_obj = date.fromisoformat(target_date) if target_date else None
    
    notification = notification_service.get_notification(
        user_id=current_user.id,
        target_date=target_date_obj,
        prefecture=prefecture
    )
    
    if notification:
        return NotificationResponse(
            enabled=notification.get("enabled", False),
            target_date=str(notification["target_date"]) if notification.get("target_date") else None,
            prefecture=notification.get("prefecture")
        )
    else:
        return NotificationResponse(enabled=False)
