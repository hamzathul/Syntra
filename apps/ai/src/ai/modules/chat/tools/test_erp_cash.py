"""Cash tool tests — aggregation only; fetchers are monkeypatched."""

from ai.modules.chat.tools.erp_cash import summarize_cash


def test_summarize_cash_combines_balances() -> None:
    cash = {"balance": 1000}
    banks = [
        {"name": "HBL", "currentBalance": 5000},
        {"name": "Meezan", "currentBalance": 2500},
    ]

    result = summarize_cash(cash, banks)

    assert "Cash=1000.00" in result
    assert "banks total=7500.00" in result
    assert "combined=8500.00" in result
    assert "HBL" in result


def test_summarize_cash_no_banks() -> None:
    result = summarize_cash({"balance": 100}, [])

    assert "Cash=100.00" in result
    assert "(no banks)" in result
