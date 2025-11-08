from typing import List, Dict, Any
import logging

from fastapi import HTTPException, status

from .postgres_base import PostgresService


logger = logging.getLogger(__name__)


class FavoriteService(PostgresService):
    def __init__(self) -> None:
        super().__init__("worker_favorites")
    
    def add_favorite(self, user_id: str, job_id: str) -> Dict[str, Any]:
        """Add a job to user's favorites"""
        try:
            with self._get_cursor() as cursor:
                query = """
                    INSERT INTO worker_favorites (user_id, job_id)
                    VALUES (%s::uuid, %s::uuid)
                    ON CONFLICT (user_id, job_id) DO NOTHING
                    RETURNING id, user_id, job_id, created_at
                """
                cursor.execute(query, (user_id, job_id))
                result = cursor.fetchone()
                
                if result:
                    return dict(result)
                else:
                    # Already exists
                    cursor.execute(
                        "SELECT * FROM worker_favorites WHERE user_id = %s::uuid AND job_id = %s::uuid",
                        (user_id, job_id)
                    )
                    return dict(cursor.fetchone())
        except Exception as e:
            logger.error(f"Error adding favorite: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add favorite"
            )
    
    def remove_favorite(self, user_id: str, job_id: str) -> None:
        """Remove a job from user's favorites"""
        try:
            with self._get_cursor() as cursor:
                query = """
                    DELETE FROM worker_favorites
                    WHERE user_id = %s::uuid AND job_id = %s::uuid
                """
                cursor.execute(query, (user_id, job_id))
        except Exception as e:
            logger.error(f"Error removing favorite: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to remove favorite"
            )
    
    def get_user_favorites(self, user_id: str) -> List[str]:
        """Get list of job IDs that user has favorited"""
        try:
            with self._get_cursor() as cursor:
                query = """
                    SELECT job_id FROM worker_favorites
                    WHERE user_id = %s::uuid
                    ORDER BY created_at DESC
                """
                cursor.execute(query, (user_id,))
                results = cursor.fetchall()
                return [str(row["job_id"]) for row in results]
        except Exception as e:
            logger.error(f"Error getting favorites: {e}")
            return []
