from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/secureai"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "supersecretkey-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OPENAI_API_KEY: str = "your_openai_key"
    GEMINI_API_KEY: str = "your_gemini_key"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
