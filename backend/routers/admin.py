from typing import List
from fastapi import APIRouter, Depends, Query

from dependencies import require_role, get_user_service
from schemas import UserRead, UserRole
from services.admin_service import AdminService
from services.user_service import UserService

router = APIRouter()


def get_admin_service() -> AdminService:
    return AdminService()


@router.get("/dashboard")
async def dashboard(
    _: UserRead = Depends(require_role(UserRole.ADMIN)),
    admin_service: AdminService = Depends(get_admin_service),
):
    return admin_service.get_dashboard_stats()


@router.get("/stats")
async def stats(
    _: UserRead = Depends(require_role(UserRole.ADMIN)),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Get platform statistics for admin dashboard"""
    return admin_service.get_stats()


@router.get("/users", response_model=List[UserRead])
async def list_users(
    _: UserRead = Depends(require_role(UserRole.ADMIN)),
    role: str = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    user_service: UserService = Depends(get_user_service),
):
    """Get all users (admin only)"""
    return user_service.list_users(role=role, limit=limit)
