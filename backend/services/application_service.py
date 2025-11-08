from typing import Dict, Optional

from fastapi import HTTPException, status

from schemas import (
    ApplicationCreate,
    ApplicationList,
    ApplicationRead,
    ApplicationStatus,
    ApplicationUpdate,
    JobStatus,
)

from .postgres_base import PostgresService
from .job_service import JobService


class ApplicationService(PostgresService):
    def __init__(self, job_service: Optional[JobService] = None) -> None:
        super().__init__("applications")
        self.jobs = job_service or JobService()

    def _to_application(self, data: Dict) -> ApplicationRead:
        return ApplicationRead(**data)

    def create_application(self, worker_id: str, payload: ApplicationCreate) -> ApplicationRead:
        job = self.jobs.get_job(payload.job_id)
        if job.status == JobStatus.CLOSED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job closed")
        with self._get_cursor() as cursor:
            cursor.execute(
                f"SELECT id FROM {self.table_name} WHERE job_id = %s AND worker_id = %s LIMIT 1",
                (payload.job_id, worker_id)
            )
            existing = cursor.fetchone()
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already applied")
        record = payload.dict()
        record["worker_id"] = worker_id
        record["status"] = ApplicationStatus.PENDING.value
        created = self.insert(record)
        return self._to_application(created)

    def update_application(self, application_id: str, payload: ApplicationUpdate) -> ApplicationRead:
        update_data = payload.dict(exclude_unset=True)
        if "status" in update_data and isinstance(update_data["status"], ApplicationStatus):
            update_data["status"] = update_data["status"].value
        updated = self.update(application_id, update_data)
        return self._to_application(updated)

    def list_applications(
        self,
        *,
        job_id: Optional[str] = None,
        worker_id: Optional[str] = None,
        status_filter: Optional[ApplicationStatus] = None,
        page: int = 1,
        size: int = 20,
    ) -> ApplicationList:
        filters = {}
        if job_id:
            filters["job_id"] = job_id
        if worker_id:
            filters["worker_id"] = worker_id
        if status_filter:
            filters["status"] = status_filter.value
        start = (page - 1) * size
        end = start + size - 1
        response = self.list(filters=filters, range_=(start, end), order=("created_at", "desc"))
        items = [self._to_application(item) for item in response["items"]]
        total = response["count"]
        return ApplicationList(items=items, total=total, page=page, size=size)

    def get_application(self, application_id: str) -> ApplicationRead:
        data = self.get_by_id(application_id)
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        return self._to_application(data)
