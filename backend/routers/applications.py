from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from dependencies import get_current_user
from schemas import (
    ApplicationCreate,
    ApplicationList,
    ApplicationRead,
    ApplicationStatus,
    ApplicationUpdate,
    JobStatus,
    UserRead,
    UserRole,
)
from services.application_service import ApplicationService
from services.job_service import JobService

router = APIRouter()


def get_application_service() -> ApplicationService:
    return ApplicationService()


def get_job_service() -> JobService:
    return JobService()


@router.get("/", response_model=ApplicationList)
async def list_applications(
    job_id: Optional[str] = Query(default=None),
    status_filter: Optional[ApplicationStatus] = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: UserRead = Depends(get_current_user),
    application_service: ApplicationService = Depends(get_application_service),
    job_service: JobService = Depends(get_job_service),
) -> ApplicationList:
    worker_id = None
    job_filter = job_id
    if current_user.role == UserRole.WORKER:
        worker_id = current_user.id
    elif current_user.role == UserRole.COMPANY:
        if not job_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="job_id is required")
        job = job_service.get_job(job_id)
        if job.company_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return application_service.list_applications(
        job_id=job_filter,
        worker_id=worker_id,
        status_filter=status_filter,
        page=page,
        size=size,
    )


@router.get("/{application_id}", response_model=ApplicationRead)
async def get_application(
    application_id: str,
    current_user: UserRead = Depends(get_current_user),
    application_service: ApplicationService = Depends(get_application_service),
    job_service: JobService = Depends(get_job_service),
) -> ApplicationRead:
    application = application_service.get_application(application_id)
    if current_user.role == UserRole.WORKER and application.worker_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if current_user.role == UserRole.COMPANY:
        job = job_service.get_job(application.job_id)
        if job.company_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return application


@router.post("/", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: ApplicationCreate,
    current_user: UserRead = Depends(get_current_user),
    application_service: ApplicationService = Depends(get_application_service),
    job_service: JobService = Depends(get_job_service),
) -> ApplicationRead:
    if current_user.role != UserRole.WORKER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only workers can apply")
    job = job_service.get_job(payload.job_id)
    if job.status != JobStatus.PUBLISHED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job not open for applications")
    return application_service.create_application(current_user.id, payload)


@router.patch("/{application_id}", response_model=ApplicationRead)
async def update_application(
    application_id: str,
    payload: ApplicationUpdate,
    current_user: UserRead = Depends(get_current_user),
    application_service: ApplicationService = Depends(get_application_service),
    job_service: JobService = Depends(get_job_service),
) -> ApplicationRead:
    application = application_service.get_application(application_id)
    job = job_service.get_job(application.job_id)
    if current_user.role == UserRole.WORKER:
        if application.worker_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        if payload.status and payload.status not in {ApplicationStatus.WITHDRAWN}:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Workers cannot change status")
    elif current_user.role == UserRole.COMPANY:
        if job.company_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return application_service.update_application(application_id, payload)
