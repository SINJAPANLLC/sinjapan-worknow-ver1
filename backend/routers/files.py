import os
from datetime import datetime
from pathlib import Path
from typing import Literal

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from dependencies import get_current_user, get_user_service
from schemas import UserRead
from services.user_service import UserService

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
ALLOWED_DOCUMENT_TYPES = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024


async def save_upload_file(upload_file: UploadFile, file_type: str, user_id: str) -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    extension = upload_file.filename.split(".")[-1] if upload_file.filename else "jpg"
    filename = f"{user_id}_{file_type}_{timestamp}.{extension}"
    file_path = UPLOAD_DIR / filename
    
    async with aiofiles.open(file_path, "wb") as f:
        content = await upload_file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size is {MAX_FILE_SIZE / 1024 / 1024}MB",
            )
        await f.write(content)
    
    return f"/uploads/{filename}"


@router.post("/upload/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: UserRead = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )
    
    file_url = await save_upload_file(file, "avatar", current_user.id)
    
    from schemas import UserUpdate
    updated_user = user_service.update_user(current_user.id, UserUpdate(avatar_url=file_url))
    
    return {"avatar_url": file_url, "user": updated_user}


@router.post("/upload/id-document")
async def upload_id_document(
    file: UploadFile = File(...),
    current_user: UserRead = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    if file.content_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_DOCUMENT_TYPES)}",
        )
    
    file_url = await save_upload_file(file, "id_document", current_user.id)
    
    from schemas import UserUpdate
    updated_user = user_service.update_user(current_user.id, UserUpdate(id_document_url=file_url))
    
    return {"id_document_url": file_url, "user": updated_user}
