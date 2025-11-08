from typing import List, Optional
from .postgres_base import PostgresService


class ActivityService(PostgresService):
    def __init__(self):
        super().__init__("activity_logs")

    def create(
        self,
        user_id: str,
        action_type: str,
        description: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        metadata: Optional[dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> dict:
        with self._get_cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO activity_logs (
                    user_id, action_type, entity_type, entity_id,
                    description, metadata, ip_address, user_agent
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (user_id, action_type, entity_type, entity_id, description, metadata, ip_address, user_agent)
            )
            result = cursor.fetchone()
            return dict(result) if result else {}

    def list_by_user(
        self,
        user_id: str,
        action_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[dict]:
        with self._get_cursor() as cursor:
            if action_type:
                cursor.execute(
                    """
                    SELECT * FROM activity_logs
                    WHERE user_id = %s AND action_type = %s
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (user_id, action_type, limit, offset)
                )
            else:
                cursor.execute(
                    """
                    SELECT * FROM activity_logs
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (user_id, limit, offset)
                )
            results = cursor.fetchall()
            return [dict(row) for row in results]

    def list_all(
        self,
        action_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[dict]:
        with self._get_cursor() as cursor:
            if action_type:
                cursor.execute(
                    """
                    SELECT al.*, u.full_name, u.email
                    FROM activity_logs al
                    JOIN users u ON al.user_id = u.id
                    WHERE al.action_type = %s
                    ORDER BY al.created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (action_type, limit, offset)
                )
            else:
                cursor.execute(
                    """
                    SELECT al.*, u.full_name, u.email
                    FROM activity_logs al
                    JOIN users u ON al.user_id = u.id
                    ORDER BY al.created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (limit, offset)
                )
            results = cursor.fetchall()
            return [dict(row) for row in results]

    def get_by_id(self, record_id: str) -> Optional[dict]:
        with self._get_cursor() as cursor:
            cursor.execute(
                "SELECT * FROM activity_logs WHERE id = %s",
                (record_id,)
            )
            result = cursor.fetchone()
            return dict(result) if result else None
