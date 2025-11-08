from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from dependencies import get_current_user
from schemas import (
    AssignmentCreate,
    AssignmentList,
    AssignmentRead,
    AssignmentStatus,
    AssignmentUpdate,
    UserRead,
    UserRole,
)
from services.assignment_service import AssignmentService
from services.job_service import JobService

router = APIRouter()


def get_assignment_service() -> AssignmentService:
    return AssignmentService()


def get_job_service() -> JobService:
    return JobService()


@router.get("/", response_model=AssignmentList)
async def list_assignments(
    job_id: Optional[str] = Query(default=None),
    worker_id: Optional[str] = Query(default=None),
    status_filter: Optional[AssignmentStatus] = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: UserRead = Depends(get_current_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
    job_service: JobService = Depends(get_job_service),
) -> AssignmentList:
    worker_filter = worker_id
    job_filter = job_id
    if current_user.role == UserRole.WORKER:
        worker_filter = current_user.id
    elif current_user.role == UserRole.COMPANY:
        if job_id:
            job = job_service.get_job(job_id)
            if job.company_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="job_id is required")
    return assignment_service.list_assignments(
        job_id=job_filter,
        worker_id=worker_filter,
        status_filter=status_filter,
        page=page,
        size=size,
    )


@router.get("/{assignment_id}", response_model=AssignmentRead)
async def get_assignment(
    assignment_id: str,
    current_user: UserRead = Depends(get_current_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
    job_service: JobService = Depends(get_job_service),
) -> AssignmentRead:
    assignment = assignment_service.get_assignment(assignment_id)
    if current_user.role == UserRole.WORKER and assignment.worker_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if current_user.role == UserRole.COMPANY:
        job = job_service.get_job(assignment.job_id)
        if job.company_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return assignment


@router.post("/", response_model=AssignmentRead, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    payload: AssignmentCreate,
    current_user: UserRead = Depends(get_current_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
    job_service: JobService = Depends(get_job_service),
) -> AssignmentRead:
    application = assignment_service.applications.get_application(payload.application_id)
    job = job_service.get_job(application.job_id)
    if current_user.role not in {UserRole.COMPANY, UserRole.ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if current_user.role == UserRole.COMPANY and job.company_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot assign for other companies")
    return assignment_service.create_assignment(payload)


@router.patch("/{assignment_id}", response_model=AssignmentRead)
async def update_assignment(
    assignment_id: str,
    payload: AssignmentUpdate,
    current_user: UserRead = Depends(get_current_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
    job_service: JobService = Depends(get_job_service),
) -> AssignmentRead:
    assignment = assignment_service.get_assignment(assignment_id)
    if current_user.role == UserRole.WORKER and assignment.worker_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if current_user.role == UserRole.COMPANY:
        job = job_service.get_job(assignment.job_id)
        if job.company_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return assignment_service.update_assignment(assignment_id, payload)
