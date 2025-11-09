from typing import Dict, List, Optional
import math

from fastapi import HTTPException, status

from schemas import JobCreate, JobList, JobRead, JobStatus, JobUpdate

from .postgres_base import PostgresService
from .geocoding_service import GeocodingService
from .user_service import UserService


class JobService(PostgresService):
    def __init__(self, user_service: Optional[UserService] = None) -> None:
        super().__init__("jobs")
        self.users = user_service or UserService()
    
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Haversine formula for calculating distance between two points in km"""
        R = 6371  # Earth radius in kilometers
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c

    def _to_job(self, data: Dict, include_company: bool = True) -> JobRead:
        job_data = {**data}
        if include_company and data.get("company_id"):
            try:
                company = self.users.get_user(data["company_id"])
                job_data["company_name"] = company.full_name
            except Exception:
                job_data["company_name"] = None
        return JobRead(**job_data)
    
    def _enrich_jobs_with_company(self, jobs: List[Dict]) -> List[JobRead]:
        if not jobs:
            return []
        
        company_ids = list(set(job.get("company_id") for job in jobs if job.get("company_id")))
        companies_map = {}
        
        for company_id in company_ids:
            try:
                company = self.users.get_user(company_id)
                companies_map[company_id] = company.full_name
            except Exception:
                companies_map[company_id] = None
        
        result = []
        for job_data in jobs:
            job_dict = {**job_data}
            job_dict["company_name"] = companies_map.get(job_data.get("company_id"))
            result.append(JobRead(**job_dict))
        
        return result

    async def create_job(self, company_id: str, payload: JobCreate) -> JobRead:
        record = payload.dict()
        record["company_id"] = company_id
        record["status"] = JobStatus.DRAFT.value
        
        # Auto-geocode if location is provided but coordinates are not
        if record.get("location") and not (record.get("latitude") and record.get("longitude")):
            coords = await GeocodingService.geocode_address(record["location"])
            if coords:
                record["latitude"], record["longitude"] = coords
        
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
        prefecture: Optional[str] = None,
        date: Optional[str] = None,
        sort_by: str = "created_at",
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        user_id: Optional[str] = None,
        page: int = 1,
        size: int = 20,
    ) -> JobList:
        """List jobs with advanced filtering, sorting, and distance calculation"""
        try:
            with self._get_cursor() as cursor:
                # Build dynamic query
                conditions = []
                params: List = []
                
                # Base filters
                if status_filter:
                    conditions.append("status = %s")
                    params.append(status_filter.value)
                if company_id:
                    conditions.append("company_id = %s")
                    params.append(company_id)
                if prefecture:
                    conditions.append("prefecture = %s")
                    params.append(prefecture)
                if date:
                    conditions.append("DATE(starts_at) = %s::date")
                    params.append(date)
                
                where_clause = " AND ".join(conditions) if conditions else "1=1"
                
                # Distance calculation subquery if user location provided
                distance_select = ""
                if user_lat is not None and user_lng is not None:
                    # Haversine formula in SQL
                    distance_select = f""",
                        6371 * acos(
                            cos(radians({user_lat})) * cos(radians(latitude)) *
                            cos(radians(longitude) - radians({user_lng})) +
                            sin(radians({user_lat})) * sin(radians(latitude))
                        ) as distance_km
                    """
                else:
                    distance_select = ", NULL as distance_km"
                
                # Favorite status subquery if user authenticated
                favorite_select = ""
                if user_id:
                    favorite_select = f""",
                        EXISTS(
                            SELECT 1 FROM worker_favorites
                            WHERE worker_favorites.job_id = jobs.id
                            AND worker_favorites.user_id = '{user_id}'::uuid
                        ) as is_favorite
                    """
                else:
                    favorite_select = ", false as is_favorite"
                
                # Count query
                count_query = f"SELECT COUNT(*) as total FROM jobs WHERE {where_clause}"
                cursor.execute(count_query, params)
                total = cursor.fetchone()["total"]
                
                # Order by clause - urgent jobs always come first
                order_clause_base = {
                    "created_at": "created_at DESC",
                    "hourly_rate": "hourly_rate DESC",
                    "hourly_rate_asc": "hourly_rate ASC",
                    "distance": "distance_km ASC" if user_lat and user_lng else "created_at DESC",
                }.get(sort_by, "created_at DESC")
                
                # Always prioritize urgent jobs, then apply secondary sorting
                order_clause = f"is_urgent DESC, {order_clause_base}"
                
                # Main query
                offset = (page - 1) * size
                query = f"""
                    SELECT jobs.*{distance_select}{favorite_select}
                    FROM jobs
                    WHERE {where_clause}
                    ORDER BY {order_clause}
                    LIMIT %s OFFSET %s
                """
                params.extend([size, offset])
                
                cursor.execute(query, params)
                rows = cursor.fetchall()
                
                items = self._enrich_jobs_with_company([dict(row) for row in rows])
                return JobList(items=items, total=total, page=page, size=size)
                
        except Exception as e:
            self.logger.error(f"Error in list_jobs: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to list jobs"
            )

    def archive_job(self, job_id: str) -> None:
        self.update(job_id, {"status": JobStatus.CLOSED.value})

    def delete_job(self, job_id: str) -> None:
        job = self.get_by_id(job_id)
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        self.delete(job_id)
