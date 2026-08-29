from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "MerchantAgent API"
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3001"]
    
    class condig:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
settings = Settings()