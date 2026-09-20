"""ERP stock tool — read-only aggregation.

Calls ERP `GET /api/v1/items?limit=100`, then filters in Python:
low stock = `GOODS` with `openingStock <= minStockQuantity`
(both set). Output capped at 10 lines so the model context stays small.
"""

from typing import Any

import httpx
import structlog
from langchain_core.tools import tool

from ai.core.config import get_settings

log = structlog.get_logger(__name__)

_TIMEOUT_SECONDS = 5.0
_MAX_ITEMS = 100
_MAX_LINES = 10


def fetch_items(bearer_token: str, company_id: str) -> list[dict[str, Any]]:
    """Fetch up to 100 items from ERP. Separated for testability (monkeypatch me)."""
    settings = get_settings()
    response = httpx.get(
        f"{settings.ERP_API_URL}/api/v1/items",
        params={"limit": _MAX_ITEMS},
        headers={"Authorization": f"Bearer {bearer_token}", "X-Company-Id": company_id},
        timeout=_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    data = response.json()["data"]
    items = data["items"] if isinstance(data, dict) else data
    return items if isinstance(items, list) else []


def find_low_stock(items: list[Any]) -> list[dict[str, Any]]:
    low: list[dict[str, Any]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        if item.get("itemType", "GOODS") != "GOODS":
            continue
        stock = item.get("openingStock")
        minimum = item.get("minStockQuantity")
        if not isinstance(stock, (int, float)) or not isinstance(minimum, (int, float)):
            continue
        if stock <= minimum:
            low.append(item)
    return low


def summarize_stock(items: list[Any]) -> str:
    low = find_low_stock(items)
    if not low:
        return "No low-stock items found."
    lines = []
    for item in low[:_MAX_LINES]:
        assert isinstance(item, dict)
        lines.append(
            f"- {item.get('name', 'Unnamed')}: "
            f"stock={item.get('openingStock')}, min={item.get('minStockQuantity')}"
        )
    extra = f" (+{len(low) - _MAX_LINES} more)" if len(low) > _MAX_LINES else ""
    return f"Low-stock items ({len(low)}){extra}:\n" + "\n".join(lines)


def build_low_stock_tool(bearer_token: str, company_id: str):  # type: ignore[no-untyped-def]
    """Bind per-request credentials into the tool via closure."""

    @tool
    def list_low_stock_items() -> str:
        """List items at or below their minimum stock quantity."""
        try:
            items = fetch_items(bearer_token, company_id)
        except httpx.HTTPStatusError as exc:
            log.warn("stock tool erp rejected", status_code=exc.response.status_code)
            return "ERP rejected the items request (invalid token or company)."
        except httpx.HTTPError as exc:
            log.warn("stock tool erp unreachable", error=str(exc))
            return "ERP is currently unreachable, try again shortly."
        return summarize_stock(items)

    return list_low_stock_items
