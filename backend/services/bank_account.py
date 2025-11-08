from typing import List, Optional
from .postgres_base import PostgresService


class BankAccountService(PostgresService):
    def __init__(self):
        super().__init__("bank_accounts")

    def create(self, user_id: str, data: dict) -> dict:
        with self._get_cursor() as cursor:
            if data.get('is_default'):
                cursor.execute(
                    "UPDATE bank_accounts SET is_default = false WHERE user_id = %s",
                    (user_id,)
                )

            cursor.execute(
                """
                INSERT INTO bank_accounts (
                    user_id, bank_name, bank_code, branch_name, branch_code,
                    account_type, account_number, account_holder_name, is_default
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    user_id,
                    data['bank_name'],
                    data.get('bank_code'),
                    data['branch_name'],
                    data.get('branch_code'),
                    data['account_type'],
                    data['account_number'],
                    data['account_holder_name'],
                    data.get('is_default', False)
                )
            )
            result = cursor.fetchone()
            return dict(result) if result else {}

    def get_by_user_id(self, account_id: str, user_id: str) -> Optional[dict]:
        with self._get_cursor() as cursor:
            cursor.execute(
                "SELECT * FROM bank_accounts WHERE id = %s AND user_id = %s",
                (account_id, user_id)
            )
            result = cursor.fetchone()
            return dict(result) if result else None

    def list_by_user(self, user_id: str) -> List[dict]:
        with self._get_cursor() as cursor:
            cursor.execute(
                "SELECT * FROM bank_accounts WHERE user_id = %s ORDER BY is_default DESC, created_at DESC",
                (user_id,)
            )
            results = cursor.fetchall()
            return [dict(row) for row in results]

    def update_account(self, account_id: str, user_id: str, data: dict) -> Optional[dict]:
        with self._get_cursor() as cursor:
            if data.get('is_default'):
                cursor.execute(
                    "UPDATE bank_accounts SET is_default = false WHERE user_id = %s AND id != %s",
                    (user_id, account_id)
                )

            fields = []
            values = []
            
            for key, value in data.items():
                if value is not None:
                    fields.append(f"{key} = %s")
                    values.append(value)

            if not fields:
                return self.get_by_user_id(account_id, user_id)

            values.extend([account_id, user_id])
            query = f"""
                UPDATE bank_accounts 
                SET {', '.join(fields)}, updated_at = NOW() 
                WHERE id = %s AND user_id = %s
                RETURNING *
            """
            
            cursor.execute(query, values)
            result = cursor.fetchone()
            return dict(result) if result else None

    def delete_account(self, account_id: str, user_id: str) -> bool:
        with self._get_cursor() as cursor:
            cursor.execute(
                "DELETE FROM bank_accounts WHERE id = %s AND user_id = %s",
                (account_id, user_id)
            )
            return cursor.rowcount > 0

    def get_default(self, user_id: str) -> Optional[dict]:
        with self._get_cursor() as cursor:
            cursor.execute(
                "SELECT * FROM bank_accounts WHERE user_id = %s AND is_default = true",
                (user_id,)
            )
            result = cursor.fetchone()
            return dict(result) if result else None
