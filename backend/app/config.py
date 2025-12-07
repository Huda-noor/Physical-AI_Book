"""
Configuration management using pydantic-settings.
Loads and validates environment variables from .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Qdrant Configuration
    qdrant_url: str
    qdrant_api_key: str

    # Neon PostgreSQL Configuration
    database_url: str

    # Embedding Model Configuration
    transformers_cache: str = "./models_cache"
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2"

    # API Configuration
    allowed_origins: str = "http://localhost:3000"
    rate_limit_per_minute: int = 10

    # Logging
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        """Parse comma-separated ALLOWED_ORIGINS into list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


# Global settings instance
settings = Settings()
