from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.qr_service import QRService
from services.postgres_base import PostgresService
from dependencies import get_current_user

router = APIRouter(prefix="/qr", tags=["qr"])

class CheckInRequest(BaseModel):
    token: str
    assignment_id: str

class CheckOutRequest(BaseModel):
    token: str
    assignment_id: str

@router.get("/check-in/{assignment_id}")
async def get_check_in_qr(
    assignment_id: str,
    current_user: dict = Depends(get_current_user),
    db: PostgresService = Depends()
):
    """Generate check-in QR code for an assignment (company users only)"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Only companies can generate QR codes")
    
    # Verify assignment belongs to this company
    verify_query = """
        SELECT a.id FROM assignments a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.id = %s AND j.company_id = %s
    """
    assignment = await db.fetchone(verify_query, (assignment_id, current_user['id']))
    if not assignment:
        raise HTTPException(status_code=403, detail="Assignment not found or does not belong to your company")
    
    qr_service = QRService(db)
    try:
        result = await qr_service.get_check_in_qr(assignment_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/check-out/{assignment_id}")
async def get_check_out_qr(
    assignment_id: str,
    current_user: dict = Depends(get_current_user),
    db: PostgresService = Depends()
):
    """Generate check-out QR code for an assignment (company users only)"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Only companies can generate QR codes")
    
    # Verify assignment belongs to this company
    verify_query = """
        SELECT a.id FROM assignments a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.id = %s AND j.company_id = %s
    """
    assignment = await db.fetchone(verify_query, (assignment_id, current_user['id']))
    if not assignment:
        raise HTTPException(status_code=403, detail="Assignment not found or does not belong to your company")
    
    qr_service = QRService(db)
    try:
        result = await qr_service.get_check_out_qr(assignment_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check-in")
async def check_in(
    request: CheckInRequest,
    current_user: dict = Depends(get_current_user),
    db: PostgresService = Depends()
):
    """Worker checks in using QR code token"""
    if current_user['role'] != 'worker':
        raise HTTPException(status_code=403, detail="Only workers can check in")
    
    qr_service = QRService(db)
    try:
        result = await qr_service.check_in(
            current_user['id'],
            request.token,
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
    """Worker checks out using QR code token"""
    if current_user['role'] != 'worker':
        raise HTTPException(status_code=403, detail="Only workers can check out")
    
    qr_service = QRService(db)
    try:
        result = await qr_service.check_out(
            current_user['id'],
            request.token,
            request.assignment_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
