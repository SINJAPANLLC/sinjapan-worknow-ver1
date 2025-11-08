import base64
import json
from functools import lru_cache
from typing import Any, Dict

import firebase_admin
from firebase_admin import credentials, messaging

from .config import CFG


def _load_service_account(raw: str) -> Dict[str, Any]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        decoded = base64.b64decode(raw).decode("utf-8")
        return json.loads(decoded)


@lru_cache()
def get_firebase_app() -> firebase_admin.App:
    if firebase_admin._apps:
        return list(firebase_admin._apps.values())[0]
    cred_info: Dict[str, Any] = _load_service_account(CFG["FIREBASE_KEY"])
    cred = credentials.Certificate(cred_info)
    return firebase_admin.initialize_app(cred)


def send_push_notification(
    *,
    token: str,
    title: str,
    body: str,
    data: Dict[str, str] | None = None,
) -> None:
    app = get_firebase_app()
    message = messaging.Message(
        token=token,
        notification=messaging.Notification(title=title, body=body),
        data=data or {},
    )
    messaging.send(message, app=app)
