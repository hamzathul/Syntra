"""Overdue aggregation tests — pure `summarize_overdue` (fetchers need live ERP)."""

from ai.modules.chat.tools.erp_overdue import summarize_overdue


def test_summarize_overdue_ranks_debtors() -> None:
    parties = [
        {"id": "p1", "name": "Ali"},
        {"id": "p2", "name": "Sara"},
    ]
    sales = [
        {"partyId": "p1", "totalAmount": 1000, "receivedAmount": 200},
        {"partyId": "p2", "totalAmount": 500, "receivedAmount": 500},
        {"partyId": "p1", "totalAmount": 300, "receivedAmount": 0},
    ]

    result = summarize_overdue(parties, sales)

    assert "Outstanding receivables (1 parties" in result
    assert "Ali: owes 1100.00" in result
    assert "Sara" not in result


def test_summarize_overdue_includes_opening_balance() -> None:
    parties = [
        {
            "id": "p1",
            "name": "Ali",
            "openingBalanceType": "TO_RECEIVE",
            "openingBalanceAmount": 250,
        },
    ]

    result = summarize_overdue(parties, [])

    assert "Ali: owes 250.00" in result


def test_summarize_overdue_empty() -> None:
    assert summarize_overdue([], []) == "No outstanding receivables found."
