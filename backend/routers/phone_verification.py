import random
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from dependencies import get_current_user, get_user_service
from schemas import UserRead, UserUpdate
from services.user_service import UserService

router = APIRouter()

verification_codes = {}


class PhoneVerificationRequest(BaseModel):
    phone: str


class PhoneVerificationCode(BaseModel):
    phone: str
    code: str


@router.post("/send-code")
async def send_verification_code(
    payload: PhoneVerificationRequest,
    current_user: UserRead = Depends(get_current_user),
):
    code = str(random.randint(100000, 999999))
    verification_codes[payload.phone] = code
    
    print(f"[DEV MODE] Verification code for {payload.phone}: {code}")
    
    return {
        "message": "Verification code sent successfully",
        "dev_mode": True,
        "code": code,
    }


@router.post("/verify-code")
async def verify_phone_code(
    payload: PhoneVerificationCode,
    current_user: UserRead = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    stored_code = verification_codes.get(payload.phone)
    
    if not stored_code or stored_code != payload.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code",
        )
    
    updated_user = user_service.update_user(
        current_user.id,
        UserUpdate(phone=payload.phone, phone_verified=True)
    )
    
    del verification_codes[payload.phone]
    
    return updated_user
