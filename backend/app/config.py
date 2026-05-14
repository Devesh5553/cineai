from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    DATABASE_URL: str = "sqlite:///./moviedb.sqlite"

    TMDB_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        val = self.CORS_ORIGINS.strip()
        if not val:
            return ["http://localhost:5173", "http://localhost:3000"]
        return json.loads(val)

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
