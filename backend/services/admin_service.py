from datetime import datetime, timedelta

from utils.database import get_pg_connection, release_pg_connection
from psycopg2.extras import RealDictCursor


class AdminService:
    def __init__(self) -> None:
        pass

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

    def get_stats(self) -> dict:
        """Get comprehensive platform statistics"""
        conn = get_pg_connection()
        try:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("SELECT COUNT(*) as count FROM users")
            total_users = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM jobs")
            total_jobs = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM applications")
            total_applications = cursor.fetchone()['count']
            
            cursor.execute("""
                SELECT COALESCE(SUM(amount), 0) as total 
                FROM payments 
                WHERE status = 'completed'
            """)
            total_revenue = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'worker'")
            total_workers = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'company'")
            total_companies = cursor.fetchone()['count']
            
            return {
                "total_users": total_users,
                "total_jobs": total_jobs,
                "total_applications": total_applications,
                "total_revenue": total_revenue,
                "total_workers": total_workers,
                "total_companies": total_companies,
            }
        finally:
            cursor.close()
            release_pg_connection(conn)

    def _count(self, table: str) -> int:
        conn = get_pg_connection()
        try:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
            result = cursor.fetchone()
            return result['count'] if result else 0
        finally:
            cursor.close()
            release_pg_connection(conn)

    def _sum_payments(self) -> int:
        conn = get_pg_connection()
        try:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                "SELECT amount FROM payments WHERE status = 'succeeded'"
            )
            amounts = [row['amount'] for row in cursor.fetchall()]
            return sum(amounts)
        finally:
            cursor.close()
            release_pg_connection(conn)

    def _recent(self, table: str) -> list:
        last_week = (datetime.utcnow() - timedelta(days=7)).isoformat()
        conn = get_pg_connection()
        try:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                f"SELECT * FROM {table} WHERE created_at >= %s ORDER BY created_at DESC LIMIT 5",
                (last_week,)
            )
            return [dict(row) for row in cursor.fetchall()]
        finally:
            cursor.close()
            release_pg_connection(conn)
