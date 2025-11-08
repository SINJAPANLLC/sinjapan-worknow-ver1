from typing import Optional

from pydantic import BaseModel, Field

from .base import PaginatedResponse, TimestampedModel


class ReviewBase(TimestampedModel):
    assignment_id: str
    reviewer_id: str
    reviewee_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=2000)
    is_public: bool = True


class ReviewCreate(BaseModel):
    assignment_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=2000)
    is_public: bool = True


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=2000)
    is_public: Optional[bool] = None


class ReviewRead(ReviewBase):
    id: str


class ReviewList(PaginatedResponse[ReviewRead]):
    pass
