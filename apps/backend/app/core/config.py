from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "MerchantAgent API"
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/merchant_agent"
    REDIS_URL: str = "redis://localhost:6379/0"
    GOOGLE_CLIENT_ID: str = Field(default="", validation_alias=AliasChoices("GOOGLE_CLIENT_ID"))
    GOOGLE_CLIENT_SECRET: str = Field(default="", validation_alias=AliasChoices("GOOGLE_CLIENT_SECRET"))

    SECRET_KEY: str = Field(
        default="dev-secret-key-replace-in-production-min-32-chars-0123456789",
        validation_alias=AliasChoices("SECRET_KEY", "JWT_SECRET"),
    )
    ALGORITHM: str = Field(
        default="HS256",
        validation_alias=AliasChoices("ALGORITHM", "JWT_ALGORITHM"),
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()