"""Settings tests — construct `Settings()` directly (never the cached singleton)."""

from pathlib import Path

import pytest
from pydantic import ValidationError

from ai.core.config import Settings


@pytest.fixture(autouse=True)
def _clean_env(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    # Hermetic: clear every var Settings reads AND run from an empty dir so a
    # local customized `.env` can't be picked up. (Uses only public APIs —
    # `_env_file=` isn't in the typed `__init__` signature.)
    for var in ("ENVIRONMENT", "NODE_ENV", "PORT", "LOG_LEVEL", "CORS_ORIGINS"):
        monkeypatch.delenv(var, raising=False)
    monkeypatch.chdir(tmp_path)


def _settings() -> Settings:
    return Settings()


def test_defaults_match_env_example() -> None:
    settings = _settings()

    assert settings.ENVIRONMENT == "development"
    assert settings.PORT == 3003
    assert settings.is_production is False


def test_environment_takes_precedence_over_node_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("NODE_ENV", "development")

    assert _settings().ENVIRONMENT == "production"


def test_node_env_honored_as_fallback(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("NODE_ENV", "test")

    assert _settings().ENVIRONMENT == "test"


def test_invalid_environment_fails_fast(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENVIRONMENT", "staging")

    with pytest.raises(ValidationError):
        _settings()
