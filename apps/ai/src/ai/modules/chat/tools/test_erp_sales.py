"""Sales aggregation tests — pure `summarize_sales` (fetchers need live ERP)."""

from ai.modules.chat.tools.erp_sales import summarize_sales


def test_summarize_sales_totals() -> None:
    items = [
        {"saleDate": "2026-09-10T00:00:00Z", "totalAmount": 1000, "receivedAmount": 800},
        {"saleDate": "2026-09-12T00:00:00Z", "totalAmount": 500, "receivedAmount": 500},
    ]

    result = summarize_sales(items, "last_30d")

    assert "count=2" in result
    assert "total=1500.00" in result
    assert "received=1300.00" in result
    assert "outstanding=200.00" in result


def test_summarize_sales_skips_old_and_bad_rows() -> None:
    items = [
        {"saleDate": "2020-01-01T00:00:00Z", "totalAmount": 9999, "receivedAmount": 9999},
        {"saleDate": "not-a-date", "totalAmount": 100, "receivedAmount": 100},
        {"saleDate": "2026-09-15T00:00:00Z", "totalAmount": 200, "receivedAmount": 50},
    ]

    result = summarize_sales(items, "last_30d")

    assert "count=2" in result
    assert "total=300.00" in result


def test_summarize_sales_lists_recent_transactions() -> None:
    items = [
        {
            "saleDate": "2026-09-10T00:00:00Z",
            "partyName": "Ali",
            "totalAmount": 1000,
            "receivedAmount": 800,
        },
        {
            "saleDate": "2026-09-12T00:00:00Z",
            "partyName": "Sara",
            "totalAmount": 500,
            "receivedAmount": 500,
        },
    ]

    result = summarize_sales(items, "last_30d")

    assert "Recent transactions:" in result
    assert "- 2026-09-12 · Sara: total=500.00, received=500.00, due=0.00" in result
    assert "- 2026-09-10 · Ali: total=1000.00, received=800.00, due=200.00" in result
    # Most recent first.
    assert result.index("2026-09-12") < result.index("2026-09-10")


def test_summarize_sales_empty_has_no_transactions() -> None:
    result = summarize_sales([], "last_30d")

    assert "count=0" in result
    assert "Recent transactions" not in result
