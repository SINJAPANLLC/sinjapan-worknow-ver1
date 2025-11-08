from datetime import datetime, timedelta

from supabase import Client

from utils.database import get_supabase_client


class AdminService:
    def __init__(self) -> None:
        self.client: Client = get_supabase_client()

    def get_dashboard_stats(self) -> dict:
        users = self._count("users")
        jobs = self._count("jobs")
        revenue = self._sum_payments()
        recent_users = self._recent("users")
        recent_jobs = self._recent("jobs")
        return {
            "users": users,
            "jobs": jobs,
            "revenue": revenue,
            "recent_users": recent_users,
            "recent_jobs": recent_jobs,
        }

    def _count(self, table: str) -> int:
        response = self.client.table(table).select("id", count="exact").execute()
        return response.count or 0

    def _sum_payments(self) -> int:
        response = (
            self.client.table("payments")
            .select("amount,status")
            .eq("status", "succeeded")
            .execute()
        )
        amounts = [item.get("amount", 0) for item in response.data or []]
        return sum(amounts)

    def _recent(self, table: str) -> list:
        last_week = (datetime.utcnow() - timedelta(days=7)).isoformat()
        response = (
            self.client.table(table)
            .select("*")
            .gte("created_at", last_week)
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        )
        return response.data or []
