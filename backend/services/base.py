from typing import Any, Dict, List, Optional, Tuple

from supabase import Client

from utils.database import get_supabase_client


class SupabaseService:
    table_name: str

    def __init__(self, table_name: str) -> None:
        self.client: Client = get_supabase_client()
        self.table_name = table_name

    def _table(self):
        return self.client.table(self.table_name)

    def get_by_id(self, record_id: str) -> Optional[Dict[str, Any]]:
        response = self._table().select("*").eq("id", record_id).single().execute()
        if response.data:
            return response.data
        return None

    def list(
        self,
        filters: Optional[Dict[str, Any]] = None,
        range_: Optional[Tuple[int, int]] = None,
        order: Optional[Tuple[str, str]] = None,
    ) -> Dict[str, Any]:
        query = self._table().select("*", count="exact")
        if filters:
            for key, value in filters.items():
                if value is None:
                    continue
                query = query.eq(key, value)
        if order:
            column, direction = order
            query = query.order(column, desc=direction.lower() == "desc")
        if range_:
            start, end = range_
            query = query.range(start, end)
        response = query.execute()
        data = response.data or []
        return {"items": data, "count": response.count or len(data)}

    def insert(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        response = self._table().insert(payload).select("*").single().execute()
        if response.data:
            return response.data
        raise ValueError(response.error or "Insert failed")

    def update(self, record_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        response = (
            self._table()
            .update(payload)
            .eq("id", record_id)
            .select("*")
            .single()
            .execute()
        )
        if response.data:
            return response.data
        raise ValueError(response.error or "Update failed")

    def delete(self, record_id: str) -> None:
        response = self._table().delete().eq("id", record_id).execute()
        if response.error:
            raise ValueError(response.error)

    def bulk_insert(self, payload: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        response = self._table().insert(payload).select("*").execute()
        if response.data:
            return response.data
        raise ValueError(response.error or "Bulk insert failed")
