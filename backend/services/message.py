from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from .postgres_base import PostgresService

logger = logging.getLogger(__name__)


class MessageService(PostgresService):
    def __init__(self):
        super().__init__("messages")

    def get_or_create_conversation(
        self, user1_id: str, user2_id: str
    ) -> Optional[Dict[str, Any]]:
        """既存の会話を取得するか、新しく作成する"""
        try:
            with self._get_cursor() as cursor:
                # 既存の会話を検索（どちらの順序でも）
                query = """
                    SELECT * FROM conversations
                    WHERE (participant_1_id = %s AND participant_2_id = %s)
                       OR (participant_1_id = %s AND participant_2_id = %s)
                    LIMIT 1
                """
                cursor.execute(query, (user1_id, user2_id, user2_id, user1_id))
                conversation = cursor.fetchone()

                if conversation:
                    return dict(conversation)

                # 新しい会話を作成
                create_query = """
                    INSERT INTO conversations (participant_1_id, participant_2_id, last_message_at)
                    VALUES (%s, %s, CURRENT_TIMESTAMP)
                    RETURNING *
                """
                cursor.execute(create_query, (user1_id, user2_id))
                result = cursor.fetchone()
                return dict(result) if result else None

        except Exception as e:
            logger.error(f"Error in get_or_create_conversation: {e}")
            raise

    def is_conversation_participant(self, conversation_id: int, user_id: str) -> bool:
        """ユーザーが会話の参加者かどうかを確認"""
        try:
            with self._get_cursor() as cursor:
                query = """
                    SELECT COUNT(*) as count FROM conversations
                    WHERE id = %s AND (participant_1_id = %s OR participant_2_id = %s)
                """
                cursor.execute(query, (conversation_id, user_id, user_id))
                result = cursor.fetchone()
                return result["count"] > 0 if result else False
        except Exception as e:
            logger.error(f"Error in is_conversation_participant: {e}")
            return False

    def get_user_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        """ユーザーの全ての会話を取得"""
        try:
            with self._get_cursor() as cursor:
                query = """
                    SELECT 
                        c.*,
                        CASE 
                            WHEN c.participant_1_id = %s THEN u2.full_name
                            ELSE u1.full_name
                        END as other_user_name,
                        CASE 
                            WHEN c.participant_1_id = %s THEN c.participant_2_id
                            ELSE c.participant_1_id
                        END as other_user_id,
                        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND receiver_id = %s AND is_read = FALSE) as unread_count
                    FROM conversations c
                    LEFT JOIN users u1 ON c.participant_1_id = u1.id::text
                    LEFT JOIN users u2 ON c.participant_2_id = u2.id::text
                    WHERE c.participant_1_id::text = %s OR c.participant_2_id::text = %s
                    ORDER BY c.last_message_at DESC
                """
                cursor.execute(query, (user_id, user_id, user_id, user_id, user_id))
                results = cursor.fetchall()
                return [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Error in get_user_conversations: {e}")
            raise

    def get_conversation_messages(
        self, conversation_id: int, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """会話のメッセージを取得"""
        try:
            with self._get_cursor() as cursor:
                query = """
                    SELECT m.*, 
                           u.full_name as sender_name,
                           u.avatar_url as sender_avatar
                    FROM messages m
                    JOIN users u ON m.sender_id::text = u.id::text
                    WHERE m.conversation_id = %s
                    ORDER BY m.created_at DESC
                    LIMIT %s
                """
                cursor.execute(query, (conversation_id, limit))
                results = cursor.fetchall()
                messages = [dict(row) for row in results]
                return list(reversed(messages))  # 古い順に並び替え
        except Exception as e:
            logger.error(f"Error in get_conversation_messages: {e}")
            raise

    def send_message(
        self, conversation_id: int, sender_id: str, receiver_id: str, content: str
    ) -> Optional[Dict[str, Any]]:
        """メッセージを送信"""
        try:
            with self._get_cursor() as cursor:
                # メッセージを挿入
                query = """
                    INSERT INTO messages (conversation_id, sender_id, receiver_id, content, created_at)
                    VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                    RETURNING *
                """
                cursor.execute(query, (conversation_id, sender_id, receiver_id, content))
                message = cursor.fetchone()

                # 会話の最終メッセージ時刻を更新
                update_query = """
                    UPDATE conversations
                    SET last_message_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """
                cursor.execute(update_query, (conversation_id,))

                return dict(message) if message else None
        except Exception as e:
            logger.error(f"Error in send_message: {e}")
            raise

    def mark_messages_as_read(
        self, conversation_id: int, user_id: str
    ) -> bool:
        """会話内の未読メッセージを既読にする"""
        try:
            with self._get_cursor() as cursor:
                query = """
                    UPDATE messages
                    SET is_read = TRUE
                    WHERE conversation_id = %s AND receiver_id = %s AND is_read = FALSE
                """
                cursor.execute(query, (conversation_id, user_id))
                return True
        except Exception as e:
            logger.error(f"Error in mark_messages_as_read: {e}")
            raise

    def get_unread_count(self, user_id: str) -> int:
        """未読メッセージ数を取得"""
        try:
            with self._get_cursor() as cursor:
                query = """
                    SELECT COUNT(*) as count
                    FROM messages
                    WHERE receiver_id = %s AND is_read = FALSE
                """
                cursor.execute(query, (user_id,))
                result = cursor.fetchone()
                return result["count"] if result else 0
        except Exception as e:
            logger.error(f"Error in get_unread_count: {e}")
            return 0
