from typing import Dict, Optional

from fastapi import HTTPException, status

from schemas import UserCreate, UserRead, UserUpdate
from utils.security import hash_password

from .postgres_base import PostgresService


class UserService(PostgresService):
    def __init__(self) -> None:
        super().__init__("users")

    def _to_user(self, data: Dict) -> UserRead:
        return UserRead(**data)

    def get_by_email(self, email: str) -> Optional[UserRead]:
        with self._get_cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s LIMIT 1", (email,))
            result = cursor.fetchone()
            if not result:
                return None
            return self._to_user(dict(result))

    def get_by_email_raw(self, email: str) -> Optional[Dict]:
        with self._get_cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s LIMIT 1", (email,))
            result = cursor.fetchone()
            if not result:
                return None
            return dict(result)

    def create_user(self, payload: UserCreate) -> UserRead:
        if self.get_by_email(payload.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        record = payload.dict()
        record["password_hash"] = hash_password(record.pop("password"))
        inserted = self.insert(record)
        return self._to_user(inserted)

    def update_user(self, user_id: str, payload: UserUpdate) -> UserRead:
        update_data = payload.dict(exclude_unset=True)
        updated = self.update(user_id, update_data)
        return self._to_user(updated)

    def get_user(self, user_id: str) -> UserRead:
        data = self.get_by_id(user_id)
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return self._to_user(data)
