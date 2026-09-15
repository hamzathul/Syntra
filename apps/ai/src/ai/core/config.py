"""Environment config — mirrors backend-p `loadEnv`: validated once, fail fast."""

from functools import lru_cache
from typing import Literal

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "production", "test"]
LogLevel = Literal["trace", "debug", "info", "warn", "error", "fatal"]


class Settings(BaseSettings):
    """Validated on first access. Raises `ValidationError` on bad env (like loadEnv)."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Canonical Python name first; NODE_ENV honored as fallback so shared
    # monorepo CI/compose envs (which export NODE_ENV globally) still apply.
    ENVIRONMENT: Environment = Field(
        default="development", validation_alias=AliasChoices("ENVIRONMENT", "NODE_ENV")
    )
    PORT: int = Field(default=3003, gt=0, le=65535)
    LOG_LEVEL: LogLevel = "info"
    CORS_ORIGINS: str = "*"

    @property
    def cors_origins(self) -> list[str]:
        """Split comma list; wildcard stays a single `"*"` entry for CORSMiddleware."""
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """App-level singleton — the only place `Settings()` is constructed."""
    return Settings()
