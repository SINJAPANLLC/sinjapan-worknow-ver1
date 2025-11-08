from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from dependencies import get_current_user, require_role
from schemas.activity import ActivityLog, ActivityLogCreate
from schemas.user import UserRead, UserRole
from services.activity import ActivityService

router = APIRouter(prefix="/activities", tags=["activities"])


@router.post("/", response_model=ActivityLog, status_code=201)
def create_activity_log(
    data: ActivityLogCreate,
    request: Request,
    current_user: UserRead = Depends(get_current_user)
):
    service = ActivityService()
    try:
        result = service.create(
            user_id=current_user.id,
            action_type=data.action_type,
            description=data.description,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            metadata=data.metadata,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create activity log: {str(e)}")


@router.get("/", response_model=List[ActivityLog])
def list_activity_logs(
    action_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: UserRead = Depends(get_current_user)
):
    service = ActivityService()
    try:
        if current_user.role == UserRole.ADMIN:
            results = service.list_all(action_type=action_type, limit=limit, offset=offset)
        else:
            results = service.list_by_user(current_user.id, action_type=action_type, limit=limit, offset=offset)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list activity logs: {str(e)}")


@router.get("/{log_id}", response_model=ActivityLog)
def get_activity_log(
    log_id: str,
    current_user: UserRead = Depends(require_role(UserRole.ADMIN))
):
    service = ActivityService()
    result = service.get_by_id(log_id)
    if not result:
        raise HTTPException(status_code=404, detail="Activity log not found")
    return result
