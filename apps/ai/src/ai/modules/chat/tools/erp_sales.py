"""ERP sales tool — first LangChain `@tool` (M2). Read-only aggregation.

Calls ERP `GET /api/v1/sales?limit=100` with the request's Bearer token +
`X-Company-Id`, then aggregates in Python (ERP has no summary endpoint).
Period filtering happens here so the model gets small, truthful numbers —
never raw sale lists.
"""

from datetime import UTC, datetime, timedelta
from typing import Any, Literal

import httpx
import structlog
from langchain_core.tools import tool

from ai.core.config import get_settings

log = structlog.get_logger(__name__)

_TIMEOUT_SECONDS = 5.0
_MAX_SALES = 100

Period = Literal["last_7d", "last_30d", "this_month"]


def _cutoff(period: Period, now: datetime) -> datetime:
    if period == "last_7d":
        return now - timedelta(days=7)
    if period == "last_30d":
        return now - timedelta(days=30)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _parse_date(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)
    return parsed


def fetch_sales(bearer_token: str, company_id: str) -> list[dict[str, Any]]:
    """Fetch up to 100 sales from ERP. Separated for testability (monkeypatch me)."""
    settings = get_settings()
    response = httpx.get(
        f"{settings.ERP_API_URL}/api/v1/sales",
        params={"limit": _MAX_SALES},
        headers={"Authorization": f"Bearer {bearer_token}", "X-Company-Id": company_id},
        timeout=_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    data = response.json()["data"]
    items = data["items"] if isinstance(data, dict) else data
    return items if isinstance(items, list) else []


def summarize_sales(items: list[dict[str, Any]], period: Period) -> str:
    now = datetime.now(UTC)
    cutoff = _cutoff(period, now)
    count = 0
    total = 0.0
    received = 0.0
    for item in items:
        if not isinstance(item, dict):
            continue
        sale_date = _parse_date(item.get("saleDate"))
        if sale_date is not None and sale_date < cutoff:
            continue
        try:
            total += float(item.get("totalAmount", 0) or 0)
            received += float(item.get("receivedAmount", 0) or 0)
        except (TypeError, ValueError):
            continue
        count += 1
    outstanding = total - received
    scope = f"up to {_MAX_SALES} most recent sales" if count >= _MAX_SALES else f"{count} sales"
    return (
        f"Sales {period} ({scope}): "
        f"count={count}, total={total:.2f}, received={received:.2f}, "
        f"outstanding={outstanding:.2f}."
    )


def build_sales_summary_tool(bearer_token: str, company_id: str):  # type: ignore[no-untyped-def]
    """Bind per-request credentials into the tool via closure.

    LangChain discovers the schema from the signature + docstring —
    that's what the model sees when deciding to call it.
    """

    @tool
    def get_sales_summary(period: Period = "last_30d") -> str:
        """Summarize company sales: count, total, received, outstanding.

        Args:
            period: one of last_7d, last_30d, this_month.
        """
        try:
            items = fetch_sales(bearer_token, company_id)
        except httpx.HTTPStatusError as exc:
            log.warn("sales tool erp rejected", status_code=exc.response.status_code)
            return "ERP rejected the sales request (invalid token or company)."
        except httpx.HTTPError as exc:
            log.warn("sales tool erp unreachable", error=str(exc))
            return "ERP is currently unreachable, try again shortly."
        return summarize_sales(items, period)

    return get_sales_summary
