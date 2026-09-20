"""Sales tool tests — aggregation only; `fetch_sales` is monkeypatched."""

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
