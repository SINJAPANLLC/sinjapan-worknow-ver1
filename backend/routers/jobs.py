from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from dependencies import get_current_user
from schemas import JobCreate, JobList, JobRead, JobStatus, JobUpdate, UserRead, UserRole
from services.job_service import JobService

router = APIRouter()


def get_job_service() -> JobService:
    return JobService()


@router.get("/", response_model=JobList)
async def list_jobs(
    status_filter: Optional[JobStatus] = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    job_service: JobService = Depends(get_job_service),
) -> JobList:
    return job_service.list_jobs(status_filter=status_filter, page=page, size=size)


@router.get("/{job_id}", response_model=JobRead)
async def get_job(job_id: str, job_service: JobService = Depends(get_job_service)) -> JobRead:
    return job_service.get_job(job_id)


@router.post("/", response_model=JobRead, status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: JobCreate,
    current_user: UserRead = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service),
) -> JobRead:
    if current_user.role != UserRole.COMPANY:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only companies can post jobs")
    return job_service.create_job(current_user.id, payload)


@router.patch("/{job_id}", response_model=JobRead)
async def update_job(
    job_id: str,
    payload: JobUpdate,
    current_user: UserRead = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service),
) -> JobRead:
    job = job_service.get_job(job_id)
    if current_user.role not in {UserRole.COMPANY, UserRole.ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if current_user.role == UserRole.COMPANY and job.company_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit other companies' jobs")
    return job_service.update_job(job_id, payload)


@router.post("/{job_id}/publish", response_model=JobRead)
async def publish_job(
    job_id: str,
    current_user: UserRead = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service),
) -> JobRead:
    job = job_service.get_job(job_id)
    if current_user.role not in {UserRole.COMPANY, UserRole.ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if current_user.role == UserRole.COMPANY and job.company_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot publish other companies' jobs")
    return job_service.publish_job(job_id)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: str,
    current_user: UserRead = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service),
) -> None:
    job = job_service.get_job(job_id)
    if current_user.role not in {UserRole.COMPANY, UserRole.ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if current_user.role == UserRole.COMPANY and job.company_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete other companies' jobs")
    job_service.delete_job(job_id)
