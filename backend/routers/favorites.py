from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from dependencies import get_current_user
from schemas import UserRead
from services.favorite_service import FavoriteService


router = APIRouter()


class FavoriteResponse(BaseModel):
    job_id: str
    is_favorite: bool


def get_favorite_service() -> FavoriteService:
    return FavoriteService()


@router.post("/{job_id}", response_model=FavoriteResponse)
def add_favorite(
    job_id: str,
    current_user: UserRead = Depends(get_current_user),
    favorite_service: FavoriteService = Depends(get_favorite_service),
) -> FavoriteResponse:
    """Add a job to favorites"""
    favorite_service.add_favorite(current_user.id, job_id)
    return FavoriteResponse(job_id=job_id, is_favorite=True)


@router.delete("/{job_id}", response_model=FavoriteResponse)
def remove_favorite(
    job_id: str,
    current_user: UserRead = Depends(get_current_user),
    favorite_service: FavoriteService = Depends(get_favorite_service),
) -> FavoriteResponse:
    """Remove a job from favorites"""
    favorite_service.remove_favorite(current_user.id, job_id)
    return FavoriteResponse(job_id=job_id, is_favorite=False)


@router.get("/", response_model=List[str])
def get_favorites(
    current_user: UserRead = Depends(get_current_user),
    favorite_service: FavoriteService = Depends(get_favorite_service),
) -> List[str]:
    """Get user's favorite job IDs"""
    return favorite_service.get_user_favorites(current_user.id)
