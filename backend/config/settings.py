from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Dating App API"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    
    # Postgres
    POSTGRES_USER: str = "dating_user"
    POSTGRES_PASSWORD: str = "secure_password"
    POSTGRES_DB: str = "dating_app"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: str = "5432"
    
    # Redis
    REDIS_HOST: str = "redis"
    REDIS_PORT: str = "6379"
    
    # Auth
    SECRET_KEY: str = "replace_me_with_a_secure_random_string_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Location bounds for Pune, India
    PUNE_LAT_MIN: float = 18.25
    PUNE_LAT_MAX: float = 18.85
    PUNE_LONG_MIN: float = 73.55
    PUNE_LONG_MAX: float = 74.25
    
    @property
    def ASYNC_DATABASE_URI(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
