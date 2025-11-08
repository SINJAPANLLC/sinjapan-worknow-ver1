from datetime import datetime
from typing import Dict, Optional

from fastapi import HTTPException, status

from schemas import (
    ApplicationStatus,
    ApplicationUpdate,
    AssignmentCreate,
    AssignmentList,
    AssignmentRead,
    AssignmentStatus,
    AssignmentUpdate,
    JobStatus,
)

from .application_service import ApplicationService
from .postgres_base import PostgresService
from .job_service import JobService


class AssignmentService(PostgresService):
    def __init__(
        self,
        application_service: Optional[ApplicationService] = None,
        job_service: Optional[JobService] = None,
    ) -> None:
        super().__init__("assignments")
        self.applications = application_service or ApplicationService()
        self.jobs = job_service or JobService()

    def _to_assignment(self, data: Dict) -> AssignmentRead:
        return AssignmentRead(**data)

    def create_assignment(self, payload: AssignmentCreate) -> AssignmentRead:
        application = self.applications.get_application(payload.application_id)
        job = self.jobs.get_job(application.job_id)
        if job.status == JobStatus.CLOSED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job closed")
        if application.status not in [ApplicationStatus.INTERVIEW, ApplicationStatus.HIRED]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application not ready")
        record = payload.dict()
        record["job_id"] = application.job_id
        record["worker_id"] = application.worker_id
        record["application_id"] = application.id
        created = self.insert(record)
        self.applications.update_application(
            application.id,
            ApplicationUpdate(status=ApplicationStatus.HIRED),
        )
        return self._to_assignment(created)

    def update_assignment(self, assignment_id: str, payload: AssignmentUpdate) -> AssignmentRead:
        update_data = payload.dict(exclude_unset=True)
        if "status" in update_data and isinstance(update_data["status"], AssignmentStatus):
            update_data["status"] = update_data["status"].value
        updated = self.update(assignment_id, update_data)
        return self._to_assignment(updated)

    def list_assignments(
        self,
        *,
        job_id: Optional[str] = None,
        worker_id: Optional[str] = None,
        status_filter: Optional[AssignmentStatus] = None,
        page: int = 1,
        size: int = 20,
    ) -> AssignmentList:
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
        items = [self._to_assignment(item) for item in response["items"]]
        total = response["count"]
        return AssignmentList(items=items, total=total, page=page, size=size)

    def get_assignment(self, assignment_id: str) -> AssignmentRead:
        data = self.get_by_id(assignment_id)
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
        return self._to_assignment(data)

    def get_active_delivery(self, worker_id: str) -> Optional[AssignmentRead]:
        query = """
            SELECT * FROM assignments
            WHERE worker_id = %s
            AND status IN ('pending_pickup', 'picking_up', 'in_delivery')
            ORDER BY created_at DESC
            LIMIT 1
        """
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(query, (worker_id,))
            columns = [desc[0] for desc in cursor.description]
            row = cursor.fetchone()
            if row:
                data = dict(zip(columns, row))
                return self._to_assignment(data)
            return None
        finally:
            conn.close()

    def advance_delivery_status(self, assignment_id: str) -> AssignmentRead:
        assignment = self.get_assignment(assignment_id)
        status_flow = {
            AssignmentStatus.PENDING_PICKUP: AssignmentStatus.PICKING_UP,
            AssignmentStatus.PICKING_UP: AssignmentStatus.IN_DELIVERY,
            AssignmentStatus.IN_DELIVERY: AssignmentStatus.DELIVERED,
        }
        if assignment.status not in status_flow:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot advance from status {assignment.status}"
            )
        next_status = status_flow[assignment.status]
        update_data = {"status": next_status.value}
        if next_status == AssignmentStatus.IN_DELIVERY:
            update_data["picked_up_at"] = datetime.utcnow()
        elif next_status == AssignmentStatus.DELIVERED:
            update_data["delivered_at"] = datetime.utcnow()
            update_data["completed_at"] = datetime.utcnow()
        updated = self.update(assignment_id, update_data)
        return self._to_assignment(updated)
