from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from dependencies import get_current_user, require_role
from schemas.withdrawal import (
    WithdrawalRequest,
    WithdrawalRequestCreate,
    WithdrawalRequestUpdate
)
from schemas.user import UserRead, UserRole
from services.withdrawal import WithdrawalService

router = APIRouter(prefix="/withdrawals", tags=["withdrawals"])


@router.post("/", response_model=WithdrawalRequest, status_code=status.HTTP_201_CREATED)
def create_withdrawal_request(
    data: WithdrawalRequestCreate,
    current_user: UserRead = Depends(get_current_user)
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(status_code=403, detail="Only workers can request withdrawals")
    
    service = WithdrawalService()
    try:
        result = service.create(current_user.id, data.model_dump())
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create withdrawal request: {str(e)}")


@router.get("/", response_model=List[WithdrawalRequest])
def list_withdrawal_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: UserRead = Depends(get_current_user)
):
    service = WithdrawalService()
    try:
        if current_user.role == UserRole.ADMIN:
            results = service.list_all(status=status_filter, limit=limit, offset=offset)
        else:
            results = service.list_by_user(current_user.id, status=status_filter, limit=limit, offset=offset)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list withdrawal requests: {str(e)}")


@router.get("/balance", response_model=dict)
def get_balance(
    current_user: UserRead = Depends(get_current_user)
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(status_code=403, detail="Only workers can check balance")
    
    service = WithdrawalService()
    try:
        balance = service.get_balance(current_user.id)
        return balance
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get balance: {str(e)}")


@router.get("/{request_id}", response_model=WithdrawalRequest)
def get_withdrawal_request(
    request_id: str,
    current_user: UserRead = Depends(get_current_user)
):
    service = WithdrawalService()
    result = service.get_by_user_id(request_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Withdrawal request not found")
    return result


@router.put("/{request_id}/status", response_model=WithdrawalRequest)
def update_withdrawal_status(
    request_id: str,
    data: WithdrawalRequestUpdate,
    current_user: UserRead = Depends(require_role(UserRole.ADMIN))
):
    service = WithdrawalService()
    try:
        if not data.status:
            raise HTTPException(status_code=400, detail="Status is required")
        
        result = service.update_status(
            request_id,
            data.status.value,
            data.admin_notes
        )
        if not result:
            raise HTTPException(status_code=404, detail="Withdrawal request not found")
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update withdrawal status: {str(e)}")
