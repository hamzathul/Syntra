"""ERP stock tool — read-only aggregation over `GET /api/v1/items`.

Low stock = `GOODS` with `openingStock <= minStockQuantity` (both set).
Output capped at 10 lines so the model context stays small.
"""

from typing import Any

from langchain_core.tools import tool

from ai.modules.chat.tools._erp import ErpError, erp_get

_MAX_ITEMS = 100
_MAX_LINES = 10


def fetch_items(bearer_token: str, company_id: str) -> list[dict[str, Any]]:
    """Fetch up to 100 items from ERP. Separated for testability."""
    data = erp_get(
        "/api/v1/items", bearer_token, company_id, label="items", params={"limit": _MAX_ITEMS}
    )
    items = data.get("items", []) if isinstance(data, dict) else data
    return items if isinstance(items, list) else []


def find_low_stock(items: list[Any]) -> list[dict[str, Any]]:
    low: list[dict[str, Any]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        if item.get("itemType") != "GOODS":
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
    lines = [
        f"- {item.get('name', 'Unnamed')}: "
        f"stock={item.get('openingStock')}, min={item.get('minStockQuantity')}"
        for item in low[:_MAX_LINES]
    ]
    extra = f" (+{len(low) - _MAX_LINES} more)" if len(low) > _MAX_LINES else ""
    return f"Low-stock items ({len(low)}){extra}:\n" + "\n".join(lines)


def build_low_stock_tool(bearer_token: str, company_id: str):  # type: ignore[no-untyped-def]
    """Bind per-request credentials into the tool via closure."""

    @tool
    def list_low_stock_items() -> str:
        """List items at or below their minimum stock quantity."""
        try:
            items = fetch_items(bearer_token, company_id)
        except ErpError as exc:
            return exc.message
        return summarize_stock(items)

    return list_low_stock_items
