import json

import stripe
from fastapi import HTTPException

from utils.config import CFG


class StripeService:
    def __init__(self) -> None:
        stripe.api_key = CFG["STRIPE_API_KEY"]

    def create_connect_account(self, email: str):
        try:
            account = stripe.Account.create(
                type="express",
                country="JP",
                email=email,
                capabilities={"transfers": {"requested": True}},
                business_type="individual",
            )
            link = stripe.AccountLink.create(
                account=account.id,
                refresh_url=f"{CFG['DOMAIN']}/reauth",
                return_url=f"{CFG['DOMAIN']}/complete",
                type="account_onboarding",
            )
            return {"account_id": account.id, "onboard_url": link.url}
        except Exception as exc:  # pragma: no cover - passthrough error
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    def create_payment_intent(self, amount: int, worker_stripe_account: str):
        try:
            return stripe.PaymentIntent.create(
                amount=amount,
                currency="jpy",
                payment_method_types=["card"],
                application_fee_amount=int(amount * CFG["STRIPE_PLATFORM_FEE"] / 100),
                transfer_data={"destination": worker_stripe_account},
            )
        except Exception as exc:  # pragma: no cover - passthrough error
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    def webhook(self, payload: bytes, sig_header: str) -> dict:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, CFG["STRIPE_WEBHOOK_SECRET"]
            )
        except Exception as exc:  # pragma: no cover - passthrough error
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        print(json.dumps(event, indent=2))  # noqa: T201 - debug logging
        return event
