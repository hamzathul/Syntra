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
_PAGE_SIZE = 100
_MAX_PAGES = 5
MAX_RECORDS = _PAGE_SIZE * _MAX_PAGES


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
    params: dict[str, str | int] | None = None,
) -> Any:
    """GET an ERP endpoint, return the envelope's `data`. Raises `ErpError`."""
    body = _fetch_body(path, bearer_token, company_id, label=label, params=params)
    try:
        return body["data"]
    except (KeyError, TypeError) as exc:
        log.warn("erp tool bad payload", label=label, error=str(exc))
        raise ErpError("ERP returned an unexpected response, try again shortly.") from exc


def erp_get_all(
    path: str,
    bearer_token: str,
    company_id: str,
    *,
    label: str,
) -> tuple[list[Any], bool]:
    """Follow cursor pages (`data.meta.nextCursor`). Returns `(items, complete)`.

    Bounded at `MAX_RECORDS` — unbounded paging would let one chat message fan
    out into hundreds of requests. Callers must disclose `complete=False`.
    """
    items: list[Any] = []
    cursor: str | None = None
    for _ in range(_MAX_PAGES):
        params: dict[str, str | int] = {"limit": _PAGE_SIZE}
        if cursor:
            params["cursor"] = cursor
        body = _fetch_body(path, bearer_token, company_id, label=label, params=params)
        try:
            data = body["data"]
        except (KeyError, TypeError) as exc:
            log.warn("erp tool bad payload", label=label, error=str(exc))
            raise ErpError("ERP returned an unexpected response, try again shortly.") from exc
        if isinstance(data, list):
            items.extend(data)
            return items, True
        if not isinstance(data, dict):
            log.warn("erp tool bad payload", label=label)
            raise ErpError("ERP returned an unexpected response, try again shortly.")
        page = data.get("items", [])
        items.extend(page if isinstance(page, list) else [])
        meta = data.get("meta", {})
        cursor = meta.get("nextCursor") if isinstance(meta, dict) else None
        if not isinstance(cursor, str) or not cursor:
            return items, True
    return items, False


def _fetch_body(
    path: str,
    bearer_token: str,
    company_id: str,
    *,
    label: str,
    params: dict[str, str | int] | None,
) -> Any:
    """Raw envelope fetch — HTTP + JSON errors become `ErpError` here, once."""
    settings = get_settings()
    try:
        response = httpx.get(
            f"{settings.ERP_API_URL}{path}",
            params=params,
            headers={"Authorization": f"Bearer {bearer_token}", "X-Company-Id": company_id},
            timeout=_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        log.warn("erp tool rejected", label=label, status_code=exc.response.status_code)
        raise ErpError("ERP rejected the request (invalid token or company).") from exc
    except httpx.HTTPError as exc:
        log.warn("erp tool unreachable", label=label, error=str(exc))
        raise ErpError("ERP is currently unreachable, try again shortly.") from exc
    except ValueError as exc:
        log.warn("erp tool bad payload", label=label, error=str(exc))
        raise ErpError("ERP returned an unexpected response, try again shortly.") from exc
