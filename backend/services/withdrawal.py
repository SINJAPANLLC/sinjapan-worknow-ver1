from typing import List, Optional
from datetime import datetime
from .postgres_base import PostgresService


class WithdrawalService(PostgresService):
    def __init__(self):
        super().__init__("withdrawal_requests")

    def create(self, user_id: str, data: dict) -> dict:
        with self._get_cursor() as cursor:
            cursor.execute(
                "SELECT id FROM bank_accounts WHERE id = %s AND user_id = %s",
                (data['bank_account_id'], user_id)
            )
            account = cursor.fetchone()
            
            if not account:
                raise ValueError("Bank account not found")

            balance = self._get_available_balance(user_id)
            if balance < data['amount']:
                raise ValueError("Insufficient balance")

            cursor.execute(
                """
                INSERT INTO withdrawal_requests (
                    user_id, bank_account_id, amount, notes
                )
                VALUES (%s, %s, %s, %s)
                RETURNING *
                """,
                (user_id, data['bank_account_id'], data['amount'], data.get('notes'))
            )
            result = cursor.fetchone()
            return dict(result) if result else {}

    def get_by_user_id(self, request_id: str, user_id: str) -> Optional[dict]:
        with self._get_cursor() as cursor:
            cursor.execute(
                """
                SELECT wr.*, ba.bank_name, ba.account_number, ba.account_holder_name
                FROM withdrawal_requests wr
                JOIN bank_accounts ba ON wr.bank_account_id = ba.id
                WHERE wr.id = %s AND wr.user_id = %s
                """,
                (request_id, user_id)
            )
            result = cursor.fetchone()
            return dict(result) if result else None

    def list_by_user(
        self, 
        user_id: str, 
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[dict]:
        with self._get_cursor() as cursor:
            if status:
                cursor.execute(
                    """
                    SELECT wr.*, ba.bank_name, ba.account_number, ba.account_holder_name
                    FROM withdrawal_requests wr
                    JOIN bank_accounts ba ON wr.bank_account_id = ba.id
                    WHERE wr.user_id = %s AND wr.status = %s
                    ORDER BY wr.created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (user_id, status, limit, offset)
                )
            else:
                cursor.execute(
                    """
                    SELECT wr.*, ba.bank_name, ba.account_number, ba.account_holder_name
                    FROM withdrawal_requests wr
                    JOIN bank_accounts ba ON wr.bank_account_id = ba.id
                    WHERE wr.user_id = %s
                    ORDER BY wr.created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (user_id, limit, offset)
                )
            results = cursor.fetchall()
            return [dict(row) for row in results]

    def list_all(
        self,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[dict]:
        with self._get_cursor() as cursor:
            if status:
                cursor.execute(
                    """
                    SELECT wr.*, ba.bank_name, ba.account_number, ba.account_holder_name,
                           u.full_name, u.email
                    FROM withdrawal_requests wr
                    JOIN bank_accounts ba ON wr.bank_account_id = ba.id
                    JOIN users u ON wr.user_id = u.id
                    WHERE wr.status = %s
                    ORDER BY wr.created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (status, limit, offset)
                )
            else:
                cursor.execute(
                    """
                    SELECT wr.*, ba.bank_name, ba.account_number, ba.account_holder_name,
                           u.full_name, u.email
                    FROM withdrawal_requests wr
                    JOIN bank_accounts ba ON wr.bank_account_id = ba.id
                    JOIN users u ON wr.user_id = u.id
                    ORDER BY wr.created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (limit, offset)
                )
            results = cursor.fetchall()
            return [dict(row) for row in results]

    def update_status(
        self,
        request_id: str,
        status: str,
        admin_notes: Optional[str] = None
    ) -> Optional[dict]:
        with self._get_cursor() as cursor:
            processed_at = datetime.utcnow() if status in ['completed', 'rejected'] else None
            
            cursor.execute(
                """
                UPDATE withdrawal_requests
                SET status = %s, admin_notes = %s, processed_at = %s
                WHERE id = %s
                RETURNING *
                """,
                (status, admin_notes, processed_at, request_id)
            )
            result = cursor.fetchone()
            return dict(result) if result else None

    def _get_available_balance(self, user_id: str) -> int:
        with self._get_cursor() as cursor:
            cursor.execute(
                """
                SELECT COALESCE(SUM(p.amount), 0) as total_earned
                FROM payments p
                JOIN assignments a ON p.assignment_id = a.id
                WHERE a.worker_id = %s AND p.status = 'succeeded'
                """,
                (user_id,)
            )
            result = cursor.fetchone()
            total_earned = result['total_earned'] if result else 0
            
            cursor.execute(
                """
                SELECT COALESCE(SUM(amount), 0) as total_withdrawn
                FROM withdrawal_requests
                WHERE user_id = %s AND status IN ('completed', 'processing')
                """,
                (user_id,)
            )
            withdrawn = cursor.fetchone()
            total_withdrawn = withdrawn['total_withdrawn'] if withdrawn else 0
            
            return total_earned - total_withdrawn

    def get_balance(self, user_id: str) -> dict:
        with self._get_cursor() as cursor:
            balance = self._get_available_balance(user_id)
            
            cursor.execute(
                """
                SELECT COALESCE(SUM(amount), 0) as pending_amount
                FROM withdrawal_requests
                WHERE user_id = %s AND status = 'pending'
                """,
                (user_id,)
            )
            pending = cursor.fetchone()
            
            return {
                'available': balance,
                'pending': pending['pending_amount'] if pending else 0
            }
