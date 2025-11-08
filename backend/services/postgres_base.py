from typing import Any, Dict, List, Optional, Tuple
from contextlib import contextmanager
import uuid

from psycopg2.extras import RealDictCursor
from utils.database import get_pg_connection, release_pg_connection


class PostgresService:
    table_name: str

    def __init__(self, table_name: str) -> None:
        self.table_name = table_name

    @contextmanager
    def _get_cursor(self):
        conn = get_pg_connection()
        cursor = None
        try:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            yield cursor
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()
            release_pg_connection(conn)

    def get_by_id(self, record_id: str) -> Optional[Dict[str, Any]]:
        with self._get_cursor() as cursor:
            cursor.execute(
                f"SELECT * FROM {self.table_name} WHERE id = %s",
                (record_id,)
            )
            result = cursor.fetchone()
            return dict(result) if result else None

    def list(
        self,
        filters: Optional[Dict[str, Any]] = None,
        range_: Optional[Tuple[int, int]] = None,
        order: Optional[Tuple[str, str]] = None,
    ) -> Dict[str, Any]:
        with self._get_cursor() as cursor:
            where_clauses = []
            params = []
            
            if filters:
                for key, value in filters.items():
                    if value is not None:
                        where_clauses.append(f"{key} = %s")
                        params.append(value)
            
            where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
            
            order_sql = ""
            if order:
                column, direction = order
                order_sql = f"ORDER BY {column} {direction.upper()}"
            
            limit_sql = ""
            if range_:
                start, end = range_
                limit = end - start + 1
                limit_sql = f"LIMIT {limit} OFFSET {start}"
            
            cursor.execute(
                f"SELECT COUNT(*) as count FROM {self.table_name} {where_sql}",
                params
            )
            count = cursor.fetchone()['count']
            
            cursor.execute(
                f"SELECT * FROM {self.table_name} {where_sql} {order_sql} {limit_sql}",
                params
            )
            items = [dict(row) for row in cursor.fetchall()]
            
            return {"items": items, "count": count}

    def insert(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_cursor() as cursor:
            if 'id' not in payload:
                payload['id'] = str(uuid.uuid4())
            
            columns = ', '.join(payload.keys())
            placeholders = ', '.join(['%s'] * len(payload))
            values = list(payload.values())
            
            cursor.execute(
                f"INSERT INTO {self.table_name} ({columns}) VALUES ({placeholders}) RETURNING *",
                values
            )
            result = cursor.fetchone()
            return dict(result) if result else {}

    def update(self, record_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_cursor() as cursor:
            set_clauses = ', '.join([f"{key} = %s" for key in payload.keys()])
            set_clauses += ', updated_at = NOW()'
            values = list(payload.values()) + [record_id]
            
            cursor.execute(
                f"UPDATE {self.table_name} SET {set_clauses} WHERE id = %s RETURNING *",
                values
            )
            result = cursor.fetchone()
            if not result:
                raise ValueError(f"Record with id {record_id} not found")
            return dict(result)

    def delete(self, record_id: str) -> None:
        with self._get_cursor() as cursor:
            cursor.execute(
                f"DELETE FROM {self.table_name} WHERE id = %s",
                (record_id,)
            )

    def bulk_insert(self, payload: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        with self._get_cursor() as cursor:
            results = []
            for item in payload:
                if 'id' not in item:
                    item['id'] = str(uuid.uuid4())
                
                columns = ', '.join(item.keys())
                placeholders = ', '.join(['%s'] * len(item))
                values = list(item.values())
                
                cursor.execute(
                    f"INSERT INTO {self.table_name} ({columns}) VALUES ({placeholders}) RETURNING *",
                    values
                )
                result = cursor.fetchone()
                if result:
                    results.append(dict(result))
            
            return results
