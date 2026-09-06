from pydantic import Field, AliasChoices, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "MerchantAgent API"
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://merchant-agnet-web.vercel.app",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(o).strip().rstrip("/") for o in parsed if o]
                except Exception:
                    pass
            return [origin.strip().rstrip("/") for origin in v.split(",") if origin.strip()]
        if isinstance(v, list):
            return [str(origin).strip().rstrip("/") for origin in v if origin]
        return v

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/merchant_agent"

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        if not v:
            return v
        url = v.strip().strip("'").strip('"')
        if url.startswith("postgres://"):
            url = "postgresql+asyncpg://" + url[len("postgres://"):]
        elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = "postgresql+asyncpg://" + url[len("postgresql://"):]
        if "sslmode=" in url:
            url = url.replace("sslmode=", "ssl=")
        return url

    REDIS_URL: str = "redis://localhost:6379/0"

    @field_validator("REDIS_URL", mode="after")
    @classmethod
    def normalize_redis_url(cls, v: str) -> str:
        if not v:
            return v
        return v.strip().strip("'").strip('"')
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
        default="KHpQvGJWi4tNeMUcW8S_f36pGIRx2ti1po2yHlOuF3s=",
        validation_alias=AliasChoices("CREDENTIALS_ENCRYPTION_KEY"),
    )
    FRONTEND_URL: str = Field(
        default="http://localhost:3001",
        validation_alias=AliasChoices("FRONTEND_URL"),
    )

    @field_validator("FRONTEND_URL", mode="after")
    @classmethod
    def normalize_frontend_url(cls, v: str) -> str:
        if not v:
            return v
        return v.strip().strip("'").strip('"').rstrip("/")

    @model_validator(mode="after")
    def resolve_frontend_url(self) -> "Settings":
        import os
        is_prod = bool(
            os.environ.get("RENDER")
            or os.environ.get("RENDER_SERVICE_ID")
            or os.environ.get("VERCEL")
            or self.ENVIRONMENT.lower() == "production"
            or (os.name != "nt" and len(self.ALLOWED_ORIGINS) >= 3)
        )
        if is_prod:
            if not self.FRONTEND_URL or "localhost" in self.FRONTEND_URL or "127.0.0.1" in self.FRONTEND_URL:
                if len(self.ALLOWED_ORIGINS) >= 3 and self.ALLOWED_ORIGINS[2]:
                    self.FRONTEND_URL = self.ALLOWED_ORIGINS[2].rstrip("/")
                else:
                    for origin in self.ALLOWED_ORIGINS:
                        if origin and not origin.startswith("http://localhost") and not origin.startswith("http://127.0.0.1"):
                            self.FRONTEND_URL = origin.rstrip("/")
                            break
        else:
            if not self.FRONTEND_URL or "vercel.app" in self.FRONTEND_URL:
                if len(self.ALLOWED_ORIGINS) >= 2 and "3001" in self.ALLOWED_ORIGINS[1]:
                    self.FRONTEND_URL = self.ALLOWED_ORIGINS[1].rstrip("/")
                else:
                    self.FRONTEND_URL = "http://localhost:3001"
        return self

    AGENT_BASE_URL: str = Field(
        default="https://api.sarvam.ai/v1",
        validation_alias=AliasChoices("AGENT_BASE_URL"),
    )
    AGENT_API_KEY: str = Field(
        default="",
        validation_alias=AliasChoices("AGENT_API_KEY"),
    )
    AGENT_MODEL: str = Field(
        default="sarvam-105b",
        validation_alias=AliasChoices("AGENT_MODEL"),
    )
    
    EMBEDDING_DIM: int = Field(
        default=384,
        validation_alias=AliasChoices("EMBEDDING_DIM"),
    )

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@merchantagent.com"
    SMTP_FROM_NAME: str = "MerchantAgent"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()