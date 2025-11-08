from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from dependencies import get_current_user
from schemas.bank_account import (
    BankAccount,
    BankAccountCreate,
    BankAccountUpdate
)
from schemas.user import UserRead
from services.bank_account import BankAccountService

router = APIRouter(prefix="/bank-accounts", tags=["bank_accounts"])


@router.post("/", response_model=BankAccount, status_code=status.HTTP_201_CREATED)
def create_bank_account(
    data: BankAccountCreate,
    current_user: UserRead = Depends(get_current_user)
):
    service = BankAccountService()
    try:
        result = service.create(current_user.id, data.model_dump())
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create bank account: {str(e)}")


@router.get("/", response_model=List[BankAccount])
def list_bank_accounts(
    current_user: UserRead = Depends(get_current_user)
):
    service = BankAccountService()
    try:
        results = service.list_by_user(current_user.id)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list bank accounts: {str(e)}")


@router.get("/{account_id}", response_model=BankAccount)
def get_bank_account(
    account_id: str,
    current_user: UserRead = Depends(get_current_user)
):
    service = BankAccountService()
    result = service.get_by_user_id(account_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Bank account not found")
    return result


@router.put("/{account_id}", response_model=BankAccount)
def update_bank_account(
    account_id: str,
    data: BankAccountUpdate,
    current_user: UserRead = Depends(get_current_user)
):
    service = BankAccountService()
    try:
        result = service.update_account(account_id, current_user.id, data.model_dump(exclude_unset=True))
        if not result:
            raise HTTPException(status_code=404, detail="Bank account not found")
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update bank account: {str(e)}")


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bank_account(
    account_id: str,
    current_user: UserRead = Depends(get_current_user)
):
    service = BankAccountService()
    try:
        success = service.delete_account(account_id, current_user.id)
        if not success:
            raise HTTPException(status_code=404, detail="Bank account not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete bank account: {str(e)}")


@router.get("/default/get", response_model=BankAccount)
def get_default_bank_account(
    current_user: UserRead = Depends(get_current_user)
):
    service = BankAccountService()
    result = service.get_default(current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Default bank account not found")
    return result
