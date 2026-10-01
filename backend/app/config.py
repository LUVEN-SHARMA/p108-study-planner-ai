import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-2.5-flash")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./studyplanner.db")
    
    # Priority scoring weights
    URGENCY_WEIGHT: float = 0.40
    WEIGHTAGE_WEIGHT: float = 0.30
    DIFFICULTY_WEIGHT: float = 0.15
    WEAKNESS_WEIGHT: float = 0.15

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
