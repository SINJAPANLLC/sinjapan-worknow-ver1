from fastapi import HTTPException, status

from schemas import LoginRequest, RegisterRequest, TokenPair, UserRead
from utils.config import CFG
from utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)

from .user_service import UserService


class AuthService:
    def __init__(self, user_service: UserService | None = None) -> None:
        self.users = user_service or UserService()
        self.access_token_expire_minutes = int(CFG["JWT_EXPIRE_MINUTES"])

    def register(self, payload: RegisterRequest) -> TokenPair:
        user = self.users.create_user(payload)
        return self._build_tokens(user)

    def login(self, payload: LoginRequest) -> TokenPair:
        raw_user = self.users.get_by_email_raw(payload.email)
        if not raw_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        password_hash = raw_user.get("password_hash")
        if not password_hash or not verify_password(payload.password, password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        user = UserRead(**raw_user)
        return self._build_tokens(user)

    def refresh(self, refresh_token: str) -> TokenPair:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
        user = self.users.get_user(user_id)
        return self._build_tokens(user)

    def verify_access_token(self, token: str) -> UserRead:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = self.users.get_user(user_id)
        return user

    def _build_tokens(self, user: UserRead) -> TokenPair:
        access_token = create_access_token({"sub": user.id, "role": user.role})
        refresh_token = create_refresh_token(user.id)
        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=self.access_token_expire_minutes * 60,
        )
