from fastapi import APIRouter, Depends

from dependencies import require_role
from schemas import UserRead, UserRole
from services.admin_service import AdminService

router = APIRouter()


def get_admin_service() -> AdminService:
    return AdminService()


@router.get("/dashboard")
async def dashboard(
    _: UserRead = Depends(require_role(UserRole.ADMIN)),
    admin_service: AdminService = Depends(get_admin_service),
):
    return admin_service.get_dashboard_stats()
