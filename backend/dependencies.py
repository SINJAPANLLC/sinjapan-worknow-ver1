from fastapi import Depends, HTTPException, Security, status
from fastapi.security import OAuth2PasswordBearer

from schemas import UserRead, UserRole
from services.auth_service import AuthService
from services.user_service import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_auth_service() -> AuthService:
    return AuthService()


def get_user_service() -> UserService:
    return UserService()


def get_current_user(
    token: str = Security(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> UserRead:
    return auth_service.verify_access_token(token)


def require_role(role: UserRole):
    def _checker(user: UserRead = Depends(get_current_user)) -> UserRead:
        if user.role != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user

    return _checker
