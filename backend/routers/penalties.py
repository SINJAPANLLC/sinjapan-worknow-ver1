from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from dependencies import get_current_user
from schemas import UserRead
from schemas.penalty import PenaltyCreate, PenaltyRead, PenaltyList
from services.postgres_base import PostgresService

router = APIRouter(prefix="/penalties", tags=["penalties"])


class PenaltyService(PostgresService):
    def __init__(self):
        super().__init__("penalties")
    
    def create_penalty(self, data: PenaltyCreate) -> dict:
        return self.insert(data.dict())
    
    def get_user_penalties(self, user_id: str, is_active: Optional[bool] = None) -> list[dict]:
        filters = {"user_id": user_id}
        if is_active is not None:
            filters["is_active"] = is_active
        result = self.list(filters=filters, order=("created_at", "desc"))
        return result["items"]
    
    def get_penalty(self, penalty_id: str) -> Optional[dict]:
        return self.get_by_id(penalty_id)
    
    def deactivate_penalty(self, penalty_id: str) -> dict:
        return self.update(penalty_id, {"is_active": False})


@router.get("/", response_model=PenaltyList)
async def list_my_penalties(
    is_active: Optional[bool] = Query(None),
    current_user: UserRead = Depends(get_current_user),
):
    """Get penalties for the current user"""
    service = PenaltyService()
    penalties = service.get_user_penalties(current_user.id, is_active)
    return {"items": penalties, "total": len(penalties)}


@router.get("/{penalty_id}", response_model=PenaltyRead)
async def get_penalty(
    penalty_id: str,
    current_user: UserRead = Depends(get_current_user),
):
    """Get a specific penalty"""
    service = PenaltyService()
    penalty = service.get_penalty(penalty_id)
    if not penalty:
        raise HTTPException(status_code=404, detail="Penalty not found")
    
    if penalty["user_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return penalty


@router.post("/", response_model=PenaltyRead, status_code=status.HTTP_201_CREATED)
async def create_penalty(
    payload: PenaltyCreate,
    current_user: UserRead = Depends(get_current_user),
):
    """Create a penalty (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    service = PenaltyService()
    data = payload.dict()
    data["issued_by"] = current_user.id
    penalty = service.insert(data)
    return penalty


@router.delete("/{penalty_id}")
async def deactivate_penalty(
    penalty_id: str,
    current_user: UserRead = Depends(get_current_user),
):
    """Deactivate a penalty (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    service = PenaltyService()
    penalty = service.get_penalty(penalty_id)
    if not penalty:
        raise HTTPException(status_code=404, detail="Penalty not found")
    
    service.deactivate_penalty(penalty_id)
    return {"message": "Penalty deactivated"}
