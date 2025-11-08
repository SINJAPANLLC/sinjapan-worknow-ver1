from __future__ import annotations

import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import CFG


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_secure_token(length: int = 64) -> str:
    return secrets.token_urlsafe(length)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_minutes: Optional[int] = None) -> str:
    to_encode = data.copy()
    expire_minutes = expires_minutes or int(CFG["JWT_EXPIRE_MINUTES"])
    expire = datetime.utcnow() + timedelta(minutes=expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, CFG["JWT_SECRET"], algorithm="HS256")


def create_refresh_token(subject: str, expires_days: int = 30) -> str:
    expire = datetime.utcnow() + timedelta(days=expires_days)
    payload = {"sub": subject, "type": "refresh", "exp": expire}
    return jwt.encode(payload, CFG["JWT_SECRET"], algorithm="HS256")


def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, CFG["JWT_SECRET"], algorithms=["HS256"])
    except JWTError as exc:  # pragma: no cover - passthrough
        raise ValueError("Invalid token") from exc
