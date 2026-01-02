"""
Configuration management using pydantic-settings.
Loads and validates environment variables from .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # OpenAI Configuration
    openai_api_key: str

    # Qdrant Configuration
    qdrant_url: str
    qdrant_api_key: str

    # Neon PostgreSQL Configuration
    database_url: str

    # Model Configuration (OpenAI)
    embedding_model: str = "text-embedding-ada-002"
    llm_model: str = "gpt-4o-mini"

    # Better Auth Configuration
    better_auth_url: str = "http://localhost:3001"

    # S3 / Object Storage Configuration
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_region: str = "us-east-1"
    s3_bucket_name: str = "personalized-chapters"
    s3_endpoint_url: str = ""  # For local testing with Minio or non-AWS S3

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
