from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Receipt Assistant"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Anthropic
    ANTHROPIC_API_KEY: str = ""

    # Gemini
    GEMINI_API_KEY: str = ""

    # OpenRouter
    OPENROUTER_API_KEY: str

    # Google Cloud Storage
    GCS_BUCKET_NAME: str = ""
    GCS_CREDENTIALS_PATH: str = ""

    # Email
    BREVO_API_KEY: str
    GMAIL_USER: str
    FRONTEND_URL: str
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "case_sensitive": True, "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
