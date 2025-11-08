from utils.config import Settings


BASE_CONFIG = {
    "SUPABASE_URL": "https://example.supabase.co",
    "SUPABASE_KEY": "key",
    "STRIPE_API_KEY": "sk",
    "STRIPE_CONNECT_CLIENT_ID": "ca",
    "STRIPE_WEBHOOK_SECRET": "whsec",
    "FIREBASE_KEY": "{}",
    "JWT_SECRET": "secret",
    "DOMAIN": "https://worknow.jp",
    "ADMIN_EMAIL": "admin@example.com",
}


def test_cors_origins_parsing():
    settings = Settings(**BASE_CONFIG, CORS_ORIGINS='["https://example.com", "https://worknow.jp"]')
    assert settings.CORS_ORIGINS == ["https://example.com", "https://worknow.jp"]


def test_default_values():
    settings = Settings(**BASE_CONFIG)
    assert settings.ENVIRONMENT == "production"
    assert settings.PORT == 8000
    assert settings.STRIPE_PLATFORM_FEE == 10
