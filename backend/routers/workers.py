from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_current_user, get_user_service
from schemas import UserRead, UserRole, WorkerPublicProfile
from services.user_service import UserService

router = APIRouter()


@router.get("/{worker_id}", response_model=WorkerPublicProfile)
async def get_worker_profile(
    worker_id: str,
    current_user: UserRead = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Get public worker profile (companies/admins only)"""
    if current_user.role not in [UserRole.COMPANY, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only companies and admins can view worker profiles",
        )
    
    user = user_service.get_user(worker_id)
    
    if user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found",
        )
    
    return WorkerPublicProfile(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url,
        phone=user.phone,
        phone_verified=user.phone_verified,
        gender=user.gender,
        work_style=user.work_style,
        affiliation=user.affiliation,
        preferred_prefecture=user.preferred_prefecture,
        qualifications=user.qualifications or [],
        created_at=user.created_at,
        updated_at=user.updated_at,
    )
