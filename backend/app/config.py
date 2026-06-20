import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "MarketMind AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field("marketmind_super_secret_jwt_key_2026_change_me", env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database Settings
    POSTGRES_USER: str = Field("postgres", env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field("postgres", env="POSTGRES_PASSWORD")
    POSTGRES_HOST: str = Field("localhost", env="POSTGRES_HOST")
    POSTGRES_PORT: str = Field("5432", env="POSTGRES_PORT")
    POSTGRES_DB: str = Field("marketmind_db", env="POSTGRES_DB")

    # Redis Settings
    REDIS_HOST: str = Field("localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(6379, env="REDIS_PORT")
    
    # Financial APIs
    ALPHA_VANTAGE_API_KEY: str = Field("", env="ALPHA_VANTAGE_API_KEY")
    TWELVE_DATA_API_KEY: str = Field("", env="TWELVE_DATA_API_KEY")
    
    # Developer Settings
    DEV_NAME: str = "PODUGU MUKESH"
    DEV_EMAIL: str = "mukeshpodugu123@gmail.com"
    DEV_PHONE: str = "8143999463"
    DEV_LOCATION: str = "Srikakulam"

    @property
    def DATABASE_URL(self) -> str:
        # Check if running in Docker container where DB host might be different
        host = os.environ.get("POSTGRES_HOST", self.POSTGRES_HOST)
        # Check if database URL is explicitly passed
        env_url = os.environ.get("DATABASE_URL")
        if env_url:
            return env_url
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{host}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def SQLITE_FALLBACK_URL(self) -> str:
        return "sqlite:///./marketmind.db"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
