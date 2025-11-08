from utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hash_roundtrip():
    raw = "super-secret-password"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed)


def test_jwt_access_token_contains_subject(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    token = create_access_token({"sub": "user-123", "role": "worker"}, expires_minutes=1)
    payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert payload["role"] == "worker"


def test_refresh_token_type(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    token = create_refresh_token("user-xyz")
    payload = decode_token(token)
    assert payload["type"] == "refresh"
    assert payload["sub"] == "user-xyz"
