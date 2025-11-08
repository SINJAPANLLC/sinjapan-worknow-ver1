from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.qr_service import QRService
from services.postgres_base import PostgresService
from dependencies import get_current_user

router = APIRouter(prefix="/qr", tags=["qr"])

class CheckInRequest(BaseModel):
    qr_code_secret: str
    assignment_id: Optional[str] = None

class CheckOutRequest(BaseModel):
    qr_code_secret: str
    assignment_id: Optional[str] = None

@router.get("/company")
async def get_company_qr_code(
    current_user: dict = Depends(get_current_user),
    db: PostgresService = Depends()
):
    """Get QR code for company (company users only)"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Only companies can access QR codes")
    
    qr_service = QRService(db)
    try:
        result = await qr_service.get_company_qr_code(current_user['id'])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check-in")
async def check_in(
    request: CheckInRequest,
    current_user: dict = Depends(get_current_user),
    db: PostgresService = Depends()
):
    """Worker checks in using company QR code"""
    if current_user['role'] != 'worker':
        raise HTTPException(status_code=403, detail="Only workers can check in")
    
    qr_service = QRService(db)
    try:
        result = await qr_service.check_in(
            current_user['id'],
            request.qr_code_secret,
            request.assignment_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check-out")
async def check_out(
    request: CheckOutRequest,
    current_user: dict = Depends(get_current_user),
    db: PostgresService = Depends()
):
    """Worker checks out using company QR code"""
    if current_user['role'] != 'worker':
        raise HTTPException(status_code=403, detail="Only workers can check out")
    
    qr_service = QRService(db)
    try:
        result = await qr_service.check_out(
            current_user['id'],
            request.qr_code_secret,
            request.assignment_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
