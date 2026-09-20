"""Shared ERP HTTP helper — one place for envelope parsing + error mapping.

Tools call `erp_get()` and get the envelope's `data` back. Every upstream
failure becomes an `ErpError` carrying an already user-safe message, so
tool bodies stay two lines: fetch, then summarize.
"""

from typing import Any

import httpx
import structlog

from ai.core.config import get_settings

log = structlog.get_logger(__name__)

_TIMEOUT_SECONDS = 5.0


class ErpError(Exception):
    """Upstream failure with an already user-safe message (returned, not raised)."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


def erp_get(
    path: str,
    bearer_token: str,
    company_id: str,
    *,
    label: str,
    params: dict[str, int] | None = None,
) -> Any:
    """GET an ERP endpoint, return the envelope's `data`. Raises `ErpError`."""
    settings = get_settings()
    try:
        response = httpx.get(
            f"{settings.ERP_API_URL}{path}",
            params=params,
            headers={"Authorization": f"Bearer {bearer_token}", "X-Company-Id": company_id},
            timeout=_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        return response.json()["data"]
    except httpx.HTTPStatusError as exc:
        log.warn("erp tool rejected", label=label, status_code=exc.response.status_code)
        raise ErpError("ERP rejected the request (invalid token or company).") from exc
    except httpx.HTTPError as exc:
        log.warn("erp tool unreachable", label=label, error=str(exc))
        raise ErpError("ERP is currently unreachable, try again shortly.") from exc
    except (KeyError, ValueError, TypeError) as exc:
        log.warn("erp tool bad payload", label=label, error=str(exc))
        raise ErpError("ERP returned an unexpected response, try again shortly.") from exc
