from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from dependencies import get_current_user
from schemas import ReviewCreate, ReviewList, ReviewRead, ReviewUpdate, UserRead, UserRole
from services.review_service import ReviewService

router = APIRouter()


def get_review_service() -> ReviewService:
    return ReviewService()


@router.get("/", response_model=ReviewList)
async def list_reviews(
    assignment_id: Optional[str] = Query(default=None),
    reviewee_id: Optional[str] = Query(default=None),
    reviewer_id: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    review_service: ReviewService = Depends(get_review_service),
) -> ReviewList:
    return review_service.list_reviews(
        assignment_id=assignment_id,
        reviewee_id=reviewee_id,
        reviewer_id=reviewer_id,
        page=page,
        size=size,
    )


@router.post("/", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreate,
    current_user: UserRead = Depends(get_current_user),
    review_service: ReviewService = Depends(get_review_service),
) -> ReviewRead:
    if current_user.role not in {UserRole.WORKER, UserRole.COMPANY}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return review_service.create_review(current_user.id, payload)


@router.patch("/{review_id}", response_model=ReviewRead)
async def update_review(
    review_id: str,
    payload: ReviewUpdate,
    current_user: UserRead = Depends(get_current_user),
    review_service: ReviewService = Depends(get_review_service),
) -> ReviewRead:
    return review_service.update_review(review_id, payload, reviewer_id=current_user.id)


@router.get("/{review_id}", response_model=ReviewRead)
async def get_review(review_id: str, review_service: ReviewService = Depends(get_review_service)) -> ReviewRead:
    return review_service.get_review(review_id)
