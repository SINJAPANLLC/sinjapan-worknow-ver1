from functools import lru_cache
from typing import List

from dotenv import load_dotenv
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    SUPABASE_URL: str = Field(..., env="SUPABASE_URL")
    SUPABASE_KEY: str = Field(..., env="SUPABASE_KEY")
    STRIPE_API_KEY: str = Field(..., env="STRIPE_API_KEY")
    STRIPE_CONNECT_CLIENT_ID: str = Field(..., env="STRIPE_CONNECT_CLIENT_ID")
    STRIPE_WEBHOOK_SECRET: str = Field(..., env="STRIPE_WEBHOOK_SECRET")
    STRIPE_PLATFORM_FEE: int = Field(10, env="STRIPE_PLATFORM_FEE")
    FIREBASE_KEY: str = Field(..., env="FIREBASE_KEY")
    REDIS_URL: str = Field("redis://localhost:6379/0", env="REDIS_URL")
    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    JWT_EXPIRE_MINUTES: int = Field(60, env="JWT_EXPIRE_MINUTES")
    DOMAIN: str = Field(..., env="DOMAIN")
    ADMIN_EMAIL: str = Field(..., env="ADMIN_EMAIL")
    CORS_ORIGINS: List[str] = Field(default_factory=list, env="CORS_ORIGINS")
    ENVIRONMENT: str = Field("production", env="ENVIRONMENT")
    PORT: int = Field(8000, env="PORT")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def split_origins(cls, value):
        if isinstance(value, str):
            value = value.strip()
            if value.startswith("[") and value.endswith("]"):
                value = value[1:-1]
            if not value:
                return []
            return [origin.strip().strip('"\'') for origin in value.split(",")]
        return value


@lru_cache()
def get_settings() -> Settings:
    return Settings()


CFG = get_settings().model_dump()
