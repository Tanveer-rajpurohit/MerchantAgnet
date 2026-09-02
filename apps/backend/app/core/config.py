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

    AWS_ACCESS_KEY_ID: str = Field(default="", validation_alias=AliasChoices("AWS_ACCESS_KEY_ID"))
    AWS_SECRET_ACCESS_KEY: str = Field(default="", validation_alias=AliasChoices("AWS_SECRET_ACCESS_KEY"))
    AWS_REGION: str = Field(default="ap-south-1", validation_alias=AliasChoices("AWS_REGION"))
    AWS_S3_BUCKET_NAME: str = Field(default="merchantagent-assets", validation_alias=AliasChoices("AWS_S3_BUCKET_NAME"))
    
    CREDENTIALS_ENCRYPTION_KEY: str = Field(
        default="AXuZ9j12k91823ks09HH128931kSH88k12893k199PP=",
        validation_alias=AliasChoices("CREDENTIALS_ENCRYPTION_KEY"),
    )
    FRONTEND_URL: str = Field(
        default="http://localhost:3001",
        validation_alias=AliasChoices("FRONTEND_URL"),
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()