from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_auth_service, get_current_user
from schemas import (
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenPair,
    UserRead,
)
from services.auth_service import AuthService

router = APIRouter()


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


@router.post("/password/reset")
async def password_reset(payload: PasswordResetRequest):  # pragma: no cover - out of scope
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Reset flow handled externally")


@router.post("/password/reset/confirm")
async def password_reset_confirm(payload: PasswordResetConfirm):  # pragma: no cover - out of scope
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Reset flow handled externally")
