"""ERP cash tool — read-only aggregation.

Fetches `GET /api/v1/money/cash` (cash `balance`) and `GET /api/v1/banks`
(each bank's `currentBalance`), then reports cash + per-bank + combined
total. Small, truthful numbers — never raw movement lists.
"""

from typing import Any

import httpx
import structlog
from langchain_core.tools import tool

from ai.core.config import get_settings

log = structlog.get_logger(__name__)

_TIMEOUT_SECONDS = 5.0


def _headers(bearer_token: str, company_id: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {bearer_token}", "X-Company-Id": company_id}


def fetch_cash(bearer_token: str, company_id: str) -> dict[str, Any]:
    """Fetch the cash summary from ERP. Separated for testability (monkeypatch me)."""
    settings = get_settings()
    response = httpx.get(
        f"{settings.ERP_API_URL}/api/v1/money/cash",
        headers=_headers(bearer_token, company_id),
        timeout=_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    data = response.json()["data"]
    return data if isinstance(data, dict) else {}


def fetch_banks(bearer_token: str, company_id: str) -> list[dict[str, Any]]:
    """Fetch banks from ERP. Separated for testability (monkeypatch me)."""
    settings = get_settings()
    response = httpx.get(
        f"{settings.ERP_API_URL}/api/v1/banks",
        headers=_headers(bearer_token, company_id),
        timeout=_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    data = response.json()["data"]
    return data if isinstance(data, list) else []


def summarize_cash(cash: dict[str, Any], banks: list[Any]) -> str:
    try:
        cash_balance = float(cash.get("balance", 0) or 0)
    except (TypeError, ValueError):
        cash_balance = 0.0
    lines = []
    bank_total = 0.0
    for bank in banks:
        if not isinstance(bank, dict):
            continue
        try:
            balance = float(bank.get("currentBalance", bank.get("balance", 0)) or 0)
        except (TypeError, ValueError):
            balance = 0.0
        bank_total += balance
        lines.append(f"- {bank.get('name', 'Unnamed bank')}: {balance:.2f}")
    total = cash_balance + bank_total
    body = "\n".join(lines) if lines else "(no banks)"
    return f"Cash={cash_balance:.2f}, banks total={bank_total:.2f}, combined={total:.2f}.\n{body}"


def build_cash_tool(bearer_token: str, company_id: str):  # type: ignore[no-untyped-def]
    """Bind per-request credentials into the tool via closure."""

    @tool
    def get_cash_balance() -> str:
        """Report cash-on-hand plus per-bank balances and the combined total."""
        try:
            cash = fetch_cash(bearer_token, company_id)
            banks = fetch_banks(bearer_token, company_id)
        except httpx.HTTPStatusError as exc:
            log.warn("cash tool erp rejected", status_code=exc.response.status_code)
            return "ERP rejected the request (invalid token or company)."
        except httpx.HTTPError as exc:
            log.warn("cash tool erp unreachable", error=str(exc))
            return "ERP is currently unreachable, try again shortly."
        return summarize_cash(cash, banks)

    return get_cash_balance
