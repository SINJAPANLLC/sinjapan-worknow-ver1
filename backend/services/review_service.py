from typing import Dict, Optional

from fastapi import HTTPException, status

from schemas import ReviewCreate, ReviewList, ReviewRead, ReviewUpdate

from .assignment_service import AssignmentService
from .postgres_base import PostgresService
from .job_service import JobService


class ReviewService(PostgresService):
    def __init__(
        self,
        assignment_service: Optional[AssignmentService] = None,
        job_service: Optional[JobService] = None,
    ) -> None:
        super().__init__("reviews")
        self.assignments = assignment_service or AssignmentService()
        self.jobs = job_service or JobService()

    def _to_review(self, data: Dict) -> ReviewRead:
        return ReviewRead(**data)

    def create_review(self, reviewer_id: str, payload: ReviewCreate) -> ReviewRead:
        assignment = self.assignments.get_assignment(payload.assignment_id)
        job = self.jobs.get_job(assignment.job_id)
        company_id = job.company_id
        worker_id = assignment.worker_id
        if reviewer_id not in {company_id, worker_id}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not related to assignment")
        record = payload.dict()
        record["reviewer_id"] = reviewer_id
        record["reviewee_id"] = company_id if reviewer_id == worker_id else worker_id
        created = self.insert(record)
        return self._to_review(created)

    def update_review(self, review_id: str, payload: ReviewUpdate, reviewer_id: str) -> ReviewRead:
        review = self.get_review(review_id)
        if review.reviewer_id != reviewer_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit others' review")
        updated = self.update(review_id, payload.dict(exclude_unset=True))
        return self._to_review(updated)

    def list_reviews(
        self,
        *,
        assignment_id: Optional[str] = None,
        reviewee_id: Optional[str] = None,
        reviewer_id: Optional[str] = None,
        page: int = 1,
        size: int = 20,
    ) -> ReviewList:
        filters = {}
        if assignment_id:
            filters["assignment_id"] = assignment_id
        if reviewee_id:
            filters["reviewee_id"] = reviewee_id
        if reviewer_id:
            filters["reviewer_id"] = reviewer_id
        start = (page - 1) * size
        end = start + size - 1
        response = self.list(filters=filters, range_=(start, end), order=("created_at", "desc"))
        items = [self._to_review(item) for item in response["items"]]
        total = response["count"]
        return ReviewList(items=items, total=total, page=page, size=size)

    def get_review(self, review_id: str) -> ReviewRead:
        data = self.get_by_id(review_id)
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        return self._to_review(data)
