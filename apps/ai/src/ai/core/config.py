"""Environment config — mirrors backend-p `loadEnv`: validated once, fail fast."""

import ipaddress
from functools import lru_cache
from typing import Literal, Self
from urllib.parse import urlsplit

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "production", "test"]
LogLevel = Literal["trace", "debug", "info", "warn", "error", "fatal"]


def _is_loopback(host: str) -> bool:
    if host.lower() in {"localhost", "ip6-localhost"}:
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


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

    # Upstream services (ERP read APIs + Core identity check).
    CORE_API_URL: str = "http://localhost:3001"
    ERP_API_URL: str = "http://localhost:3002"

    # LLM via OpenRouter (OpenAI-compatible endpoint).
    LLM_BASE_URL: str = "https://openrouter.ai/api/v1"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "openai/gpt-4o-mini"
    LLM_APP_URL: str = ""
    LLM_APP_TITLE: str = "Syntra"

    @property
    def cors_origins(self) -> list[str]:
        """Split comma list; wildcard stays a single `"*"` entry for CORSMiddleware."""
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @model_validator(mode="after")
    def _require_https_upstreams_in_production(self) -> Self:
        """Bearer tokens are forwarded to these upstreams — never over cleartext.

        Fail-closed in production: `https` always passes, plaintext `http` only
        for loopback (same-host traffic). Authenticated tunnels terminate TLS,
        so they arrive as `https` and pass; plaintext-over-tunnel stays rejected.
        """
        if self.ENVIRONMENT != "production":
            return self
        for name in ("CORE_API_URL", "ERP_API_URL"):
            url = urlsplit(getattr(self, name))
            if url.scheme == "https":
                continue
            if url.scheme == "http" and _is_loopback(url.hostname or ""):
                continue
            raise ValueError(f"{name} must use https in production (http loopback allowed)")
        return self


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """App-level singleton — the only place `Settings()` is constructed."""
    return Settings()
