from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status

from dependencies import get_auth_service, get_current_user, get_user_service
from schemas import (
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenPair,
    UserRead,
    UserUpdate,
)
from pydantic import BaseModel
from services.auth_service import AuthService
from services.user_service import UserService

router = APIRouter()


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, auth_service: AuthService = Depends(get_auth_service)):
    return auth_service.register(payload)


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    return auth_service.login(payload)


@router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshTokenRequest, auth_service: AuthService = Depends(get_auth_service)):
    return auth_service.refresh(payload.refresh_token)


@router.get("/me", response_model=UserRead)
async def me(current_user: UserRead = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserRead)
async def update_profile(
    payload: UserUpdate,
    current_user: UserRead = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    return user_service.update_user(current_user.id, payload)


@router.post("/password/reset")
async def password_reset(payload: PasswordResetRequest):  # pragma: no cover - out of scope
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Reset flow handled externally")


@router.post("/password/reset/confirm")
async def password_reset_confirm(payload: PasswordResetConfirm):  # pragma: no cover - out of scope
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Reset flow handled externally")


@router.put("/online-status", response_model=UserRead)
async def set_online_status(
    is_online: bool,
    current_user: UserRead = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Set worker online/offline status"""
    if current_user.role != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can set online status",
        )
    return user_service.set_online_status(current_user.id, is_online)


@router.get("/workers/online", response_model=List[UserRead])
async def get_online_workers(
    limit: int = Query(default=100, ge=1, le=500),
    current_user: UserRead = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Get list of online workers (for companies/admins)"""
    if current_user.role not in ["company", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only companies and admins can view online workers",
        )
    return user_service.get_online_workers(limit=limit)


@router.put("/password/change")
async def change_password(
    payload: PasswordChangeRequest,
    current_user: UserRead = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Change user password"""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    user_data = user_service.get_by_id(current_user.id)
    if not user_data or not pwd_context.verify(payload.current_password, user_data.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    
    new_password_hash = pwd_context.hash(payload.new_password)
    user_service.update(current_user.id, {"password_hash": new_password_hash})
    
    return {"message": "Password changed successfully"}
