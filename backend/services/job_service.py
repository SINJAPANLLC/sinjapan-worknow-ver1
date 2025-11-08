from typing import Dict, Optional

from fastapi import HTTPException, status

from schemas import JobCreate, JobList, JobRead, JobStatus, JobUpdate

from .postgres_base import PostgresService


class JobService(PostgresService):
    def __init__(self) -> None:
        super().__init__("jobs")

    def _to_job(self, data: Dict) -> JobRead:
        return JobRead(**data)

    def create_job(self, company_id: str, payload: JobCreate) -> JobRead:
        record = payload.dict()
        record["company_id"] = company_id
        record["status"] = JobStatus.DRAFT.value
        created = self.insert(record)
        return self._to_job(created)

    def publish_job(self, job_id: str) -> JobRead:
        updated = self.update(job_id, {"status": JobStatus.PUBLISHED.value})
        return self._to_job(updated)

    def update_job(self, job_id: str, payload: JobUpdate) -> JobRead:
        update_data = payload.dict(exclude_unset=True)
        updated = self.update(job_id, update_data)
        return self._to_job(updated)

    def get_job(self, job_id: str) -> JobRead:
        data = self.get_by_id(job_id)
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        return self._to_job(data)

    def list_jobs(
        self,
        *,
        status_filter: Optional[JobStatus] = None,
        company_id: Optional[str] = None,
        page: int = 1,
        size: int = 20,
    ) -> JobList:
        filters = {}
        if status_filter:
            filters["status"] = status_filter.value
        if company_id:
            filters["company_id"] = company_id
        start = (page - 1) * size
        end = start + size - 1
        response = self.list(filters=filters, range_=(start, end), order=("created_at", "desc"))
        items = [self._to_job(item) for item in response["items"]]
        total = response["count"]
        return JobList(items=items, total=total, page=page, size=size)

    def archive_job(self, job_id: str) -> None:
        self.update(job_id, {"status": JobStatus.CLOSED.value})

    def delete_job(self, job_id: str) -> None:
        job = self.get_by_id(job_id)
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        self.delete(job_id)
