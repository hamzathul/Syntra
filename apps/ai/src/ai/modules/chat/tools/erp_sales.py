"""ERP sales tool — read-only aggregation over `GET /api/v1/sales`.

Aggregates in Python (ERP has no summary endpoint). Period filtering happens
here so the model gets small, truthful numbers — never raw sale lists.
"""

from datetime import UTC, datetime, timedelta
from typing import Any, Literal

from langchain_core.tools import tool

from ai.modules.chat.tools._erp import MAX_RECORDS, ErpError, erp_get_all

_MAX_LINES = 10

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


def fetch_sales(bearer_token: str, company_id: str) -> tuple[list[dict[str, Any]], bool]:
    """Fetch recent sales from ERP (paged). Returns `(items, complete)`."""
    items, complete = erp_get_all("/api/v1/sales", bearer_token, company_id, label="sales")
    return [item for item in items if isinstance(item, dict)], complete


def summarize_sales(items: list[dict[str, Any]], period: Period, *, complete: bool = True) -> str:
    now = datetime.now(UTC)
    cutoff = _cutoff(period, now)
    count = 0
    total = 0.0
    received = 0.0
    kept: list[tuple[str, str, float, float]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        sale_date = _parse_date(item.get("saleDate"))
        if sale_date is None or sale_date < cutoff:
            continue
        try:
            item_total = float(item.get("totalAmount", 0) or 0)
            item_received = float(item.get("receivedAmount", 0) or 0)
        except (TypeError, ValueError):
            continue
        total += item_total
        received += item_received
        count += 1
        kept.append(
            (
                str(item.get("saleDate", ""))[:10] or "unknown date",
                str(item.get("partyName") or "Unknown party"),
                item_total,
                item_received,
            )
        )
    outstanding = total - received
    if complete:
        scope = (
            f"up to {MAX_RECORDS} most recent sales" if count >= MAX_RECORDS else f"{count} sales"
        )
    else:
        scope = f"{len(items)} most recent sales (older records excluded)"
    summary = (
        f"Sales {period} ({scope}): "
        f"count={count}, total={total:.2f}, received={received:.2f}, "
        f"outstanding={outstanding:.2f}."
    )
    if not kept:
        return summary
    kept.sort(key=lambda row: row[0], reverse=True)
    lines = [
        f"- {day} · {name}: total={item_total:.2f}, "
        f"received={item_received:.2f}, due={item_total - item_received:.2f}"
        for day, name, item_total, item_received in kept[:_MAX_LINES]
    ]
    extra = f" (+{len(kept) - _MAX_LINES} more)" if len(kept) > _MAX_LINES else ""
    return summary + f"\nRecent transactions{extra}:\n" + "\n".join(lines)


def build_sales_summary_tool(bearer_token: str, company_id: str):  # type: ignore[no-untyped-def]
    """Bind per-request credentials into the tool via closure.

    LangChain discovers the schema from the signature + docstring —
    that's what the model sees when deciding to call it.
    """

    @tool
    def get_sales_summary(period: Period = "last_30d") -> str:
        """Summarize company sales AND list recent individual transactions.

        Returns totals (count, total, received, outstanding) plus one line
        per recent transaction with date, party, and amounts.

        Args:
            period: one of last_7d, last_30d, this_month.
        """
        try:
            items, complete = fetch_sales(bearer_token, company_id)
        except ErpError as exc:
            return exc.message
        return summarize_sales(items, period, complete=complete)

    return get_sales_summary
