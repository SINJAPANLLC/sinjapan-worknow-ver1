from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from dependencies import get_current_user
from schemas import (
    ConnectAccountRequest,
    PaymentCreate,
    PaymentIntentCreateRequest,
    PaymentList,
    PaymentRead,
    PaymentStatus,
    PaymentUpdate,
    UserRead,
    UserRole,
)
from services.assignment_service import AssignmentService
from services.payment_service import PaymentService
from services.stripe_service import StripeService

router = APIRouter()


def get_payment_service() -> PaymentService:
    return PaymentService()


def get_assignment_service() -> AssignmentService:
    return AssignmentService()


def get_stripe_service() -> StripeService:
    return StripeService()


@router.post("/connect/account")
async def create_connect_account(
    payload: ConnectAccountRequest,
    stripe: StripeService = Depends(get_stripe_service),
    current_user: UserRead = Depends(get_current_user),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only workers can create accounts")
    return stripe.create_connect_account(payload.email)


@router.post("/intent")
async def create_payment_intent(
    payload: PaymentIntentCreateRequest,
    stripe: StripeService = Depends(get_stripe_service),
    current_user: UserRead = Depends(get_current_user),
):
    if current_user.role not in {UserRole.COMPANY, UserRole.ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return stripe.create_payment_intent(payload.amount, payload.worker_stripe_account)


@router.post("/", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payload: PaymentCreate,
    current_user: UserRead = Depends(get_current_user),
    payment_service: PaymentService = Depends(get_payment_service),
) -> PaymentRead:
    if current_user.role not in {UserRole.COMPANY, UserRole.ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return payment_service.create_payment(payload)


@router.get("/", response_model=PaymentList)
async def list_payments(
    assignment_id: Optional[str] = Query(default=None),
    status_filter: PaymentStatus | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: UserRead = Depends(get_current_user),
    payment_service: PaymentService = Depends(get_payment_service),
) -> PaymentList:
    if current_user.role == UserRole.WORKER and not assignment_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="assignment_id is required for workers")
    return payment_service.list_payments(
        assignment_id=assignment_id,
        status_filter=status_filter,
        page=page,
        size=size,
    )


@router.get("/{payment_id}", response_model=PaymentRead)
async def get_payment(
    payment_id: str,
    current_user: UserRead = Depends(get_current_user),
    payment_service: PaymentService = Depends(get_payment_service),
    assignment_service: AssignmentService = Depends(get_assignment_service),
) -> PaymentRead:
    payment = payment_service.get_payment(payment_id)
    assignment = assignment_service.get_assignment(payment.assignment_id)
    if current_user.role == UserRole.WORKER and assignment.worker_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if current_user.role == UserRole.COMPANY:
        job = assignment_service.jobs.get_job(assignment.job_id)
        if job.company_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return payment


@router.patch("/{payment_id}", response_model=PaymentRead)
async def update_payment(
    payment_id: str,
    payload: PaymentUpdate,
    current_user: UserRead = Depends(get_current_user),
    payment_service: PaymentService = Depends(get_payment_service),
) -> PaymentRead:
    if current_user.role not in {UserRole.ADMIN, UserRole.COMPANY}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return payment_service.update_payment(payment_id, payload)


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe: StripeService = Depends(get_stripe_service),
    payment_service: PaymentService = Depends(get_payment_service),
):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")
    if sig_header is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Stripe-Signature header")
    event = stripe.webhook(payload, sig_header)

    event_type = event.get("type", "")
    intent = event.get("data", {}).get("object", {})
    if event_type.startswith("payment_intent") and intent:
        intent_id = intent.get("id")
        status_value = intent.get("status")
        transfer_id = intent.get("latest_charge")
        if intent_id and status_value:
            payment_service.update_by_intent(intent_id, status_value, transfer_id=transfer_id)

    return {"received": True}
