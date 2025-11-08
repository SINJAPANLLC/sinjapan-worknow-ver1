from typing import Dict, Optional
from datetime import datetime

from fastapi import HTTPException, status

from schemas import PaymentCreate, PaymentList, PaymentRead, PaymentStatus, PaymentUpdate

from .assignment_service import AssignmentService
from .postgres_base import PostgresService
from .stripe_service import StripeService


class PaymentService(PostgresService):
    def __init__(
        self,
        stripe_service: Optional[StripeService] = None,
        assignment_service: Optional[AssignmentService] = None,
    ) -> None:
        super().__init__("payments")
        self.stripe = stripe_service or StripeService()
        self.assignments = assignment_service or AssignmentService()

    def _to_payment(self, data: Dict) -> PaymentRead:
        return PaymentRead(**data)

    def create_payment(self, payload: PaymentCreate) -> PaymentRead:
        assignment = self.assignments.get_assignment(payload.assignment_id)
        metadata = assignment.metadata or {}
        worker_stripe_account = metadata.get("worker_stripe_account")
        if not worker_stripe_account:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Worker Stripe account missing")
        intent = self.stripe.create_payment_intent(payload.amount, worker_stripe_account)
        record = payload.dict()
        record["status"] = intent.get("status", PaymentStatus.REQUIRES_PAYMENT_METHOD.value)
        record["stripe_payment_intent_id"] = intent.get("id")
        inserted = self.insert(record)
        return self._to_payment(inserted)

    def update_payment(self, payment_id: str, payload: PaymentUpdate) -> PaymentRead:
        update_data = payload.dict(exclude_unset=True)
        if "status" in update_data and isinstance(update_data["status"], PaymentStatus):
            update_data["status"] = update_data["status"].value
        updated = self.update(payment_id, update_data)
        return self._to_payment(updated)

    def update_by_intent(self, intent_id: str, status_value: str, transfer_id: Optional[str] = None) -> None:
        with self._get_cursor() as cursor:
            cursor.execute(
                f"SELECT id FROM {self.table_name} WHERE stripe_payment_intent_id = %s LIMIT 1",
                (intent_id,)
            )
            result = cursor.fetchone()
            if not result:
                return
            update_data: Dict = {"status": status_value}
            if transfer_id:
                update_data["stripe_transfer_id"] = transfer_id
            self.update(result["id"], update_data)

    def list_payments(
        self,
        *,
        assignment_id: Optional[str] = None,
        status_filter: Optional[PaymentStatus] = None,
        page: int = 1,
        size: int = 20,
    ) -> PaymentList:
        filters = {}
        if assignment_id:
            filters["assignment_id"] = assignment_id
        if status_filter:
            filters["status"] = status_filter.value
        start = (page - 1) * size
        end = start + size - 1
        response = self.list(filters=filters, range_=(start, end), order=("created_at", "desc"))
        items = [self._to_payment(item) for item in response["items"]]
        total = response["count"]
        return PaymentList(items=items, total=total, page=page, size=size)

    def get_payment(self, payment_id: str) -> PaymentRead:
        data = self.get_by_id(payment_id)
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
        return self._to_payment(data)

    def create_internal_payment(self, assignment_id: str, amount: int) -> PaymentRead:
        """Create an internal payment record without Stripe (for automatic payment on assignment completion)"""
        record = {
            "assignment_id": assignment_id,
            "amount": amount,
            "currency": "JPY",
            "status": PaymentStatus.SUCCEEDED.value,
            "stripe_payment_intent_id": None,
            "stripe_transfer_id": None,
        }
        inserted = self.insert(record)
        return self._to_payment(inserted)
