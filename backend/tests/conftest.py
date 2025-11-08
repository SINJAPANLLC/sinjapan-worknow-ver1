import os

import pytest


@pytest.fixture(scope="session", autouse=True)
def _configure_env():
    os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
    os.environ.setdefault("SUPABASE_KEY", "service-key")
    os.environ.setdefault("STRIPE_API_KEY", "sk_test_123")
    os.environ.setdefault("STRIPE_CONNECT_CLIENT_ID", "ca_test")
    os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_test")
    os.environ.setdefault("FIREBASE_KEY", "{}")
    os.environ.setdefault("JWT_SECRET", "test-secret")
    os.environ.setdefault("DOMAIN", "http://testserver")
    os.environ.setdefault("ADMIN_EMAIL", "admin@test.local")
    os.environ.setdefault("CORS_ORIGINS", "[\"http://testserver\"]")
