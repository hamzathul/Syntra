"""ERP overdue tool — read-only aggregation across parties + sales.

Combines `GET /api/v1/parties` (id → name map) with the sales fetcher:
unpaid balances (`total - received > 0`) grouped by party, plus
`TO_RECEIVE` opening balances. Output capped at 10 lines.
"""

from typing import Any

from langchain_core.tools import tool

from ai.modules.chat.tools._erp import ErpError, erp_get
from ai.modules.chat.tools.erp_sales import fetch_sales

_MAX_PARTIES = 100
_MAX_LINES = 10


def fetch_parties(bearer_token: str, company_id: str) -> list[dict[str, Any]]:
    """Fetch up to 100 parties from ERP. Separated for testability."""
    data = erp_get(
        "/api/v1/parties",
        bearer_token,
        company_id,
        label="parties",
        params={"limit": _MAX_PARTIES},
    )
    items = data.get("items", []) if isinstance(data, dict) else data
    return items if isinstance(items, list) else []


def summarize_overdue(parties: list[Any], sales: list[Any]) -> str:
    names: dict[str, str] = {}
    opening: dict[str, float] = {}
    for party in parties:
        if not isinstance(party, dict):
            continue
        party_id = party.get("id")
        if not isinstance(party_id, str):
            continue
        names[party_id] = str(party.get("name", "Unnamed"))
        if party.get("openingBalanceType") == "TO_RECEIVE":
            try:
                amount = float(party.get("openingBalanceAmount", 0) or 0)
            except (TypeError, ValueError):
                amount = 0.0
            if amount > 0:
                opening[party_id] = amount

    dues: dict[str, float] = dict(opening)
    for sale in sales:
        if not isinstance(sale, dict):
            continue
        try:
            due = float(sale.get("totalAmount", 0) or 0) - float(sale.get("receivedAmount", 0) or 0)
        except (TypeError, ValueError):
            continue
        if due <= 0:
            continue
        party_id = sale.get("partyId")
        key = party_id if isinstance(party_id, str) else "unknown"
        dues[key] = dues.get(key, 0.0) + due

    ranked = sorted(dues.items(), key=lambda kv: kv[1], reverse=True)
    if not ranked:
        return "No outstanding receivables found."
    lines = []
    for party_id, amount in ranked[:_MAX_LINES]:
        lines.append(f"- {names.get(party_id, party_id)}: owes {amount:.2f}")
    extra = f" (+{len(ranked) - _MAX_LINES} more)" if len(ranked) > _MAX_LINES else ""
    total = sum(dues.values())
    header = f"Outstanding receivables ({len(ranked)} parties, total={total:.2f}){extra}:\n"
    return header + "\n".join(lines)


def build_overdue_tool(bearer_token: str, company_id: str):  # type: ignore[no-untyped-def]
    """Bind per-request credentials into the tool via closure."""

    @tool
    def list_overdue_parties() -> str:
        """List parties with unpaid balances, largest debtors first."""
        try:
            parties = fetch_parties(bearer_token, company_id)
            sales = fetch_sales(bearer_token, company_id)
        except ErpError as exc:
            return exc.message
        return summarize_overdue(parties, sales)

    return list_overdue_parties
