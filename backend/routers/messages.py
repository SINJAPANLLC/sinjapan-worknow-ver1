from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from dependencies import get_current_user
from schemas import UserRead
from services.message import MessageService

router = APIRouter(prefix="/messages", tags=["messages"])


class MessageCreate(BaseModel):
    receiver_id: str
    content: str


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: str
    receiver_id: str
    content: str
    is_read: bool
    created_at: datetime
    sender_name: Optional[str] = None
    sender_avatar: Optional[str] = None


class ConversationResponse(BaseModel):
    id: int
    participant_1_id: str
    participant_2_id: str
    other_user_name: Optional[str] = None
    other_user_id: Optional[str] = None
    last_message: Optional[str] = None
    last_message_at: datetime
    unread_count: Optional[int] = 0


@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    current_user: UserRead = Depends(get_current_user),
):
    """現在のユーザーの全ての会話を取得"""
    message_service = MessageService()
    conversations = message_service.get_user_conversations(current_user.id)
    return conversations


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: int,
    limit: int = 50,
    current_user: UserRead = Depends(get_current_user),
):
    """特定の会話のメッセージを取得"""
    message_service = MessageService()
    
    # ユーザーが会話の参加者であることを確認（効率的なクエリ）
    if not message_service.is_conversation_participant(conversation_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この会話にアクセスする権限がありません"
        )
    
    messages = message_service.get_conversation_messages(conversation_id, limit)
    
    # メッセージを既読にする
    message_service.mark_messages_as_read(conversation_id, current_user.id)
    
    return messages


@router.post("/send", response_model=MessageResponse)
def send_message(
    message_data: MessageCreate,
    current_user: UserRead = Depends(get_current_user),
):
    """メッセージを送信"""
    message_service = MessageService()
    
    # 会話を取得または作成
    conversation = message_service.get_or_create_conversation(
        current_user.id, message_data.receiver_id
    )
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="会話の作成に失敗しました"
        )
    
    # メッセージを送信
    message = message_service.send_message(
        conversation["id"],
        current_user.id,
        message_data.receiver_id,
        message_data.content
    )
    
    return message


@router.get("/unread-count")
def get_unread_count(
    current_user: UserRead = Depends(get_current_user),
):
    """未読メッセージ数を取得"""
    message_service = MessageService()
    count = message_service.get_unread_count(current_user.id)
    return {"count": count}


@router.post("/conversations/{conversation_id}/mark-read")
def mark_conversation_as_read(
    conversation_id: int,
    current_user: UserRead = Depends(get_current_user),
):
    """会話のメッセージを既読にする"""
    message_service = MessageService()
    message_service.mark_messages_as_read(conversation_id, current_user.id)
    return {"success": True}
