"""Stock tool tests — aggregation only; `fetch_items` is monkeypatched."""

from ai.modules.chat.tools.erp_stock import summarize_stock


def test_summarize_stock_lists_low_items() -> None:
    items = [
        {"name": "Flour", "itemType": "GOODS", "openingStock": 5, "minStockQuantity": 10},
        {"name": "Sugar", "itemType": "GOODS", "openingStock": 50, "minStockQuantity": 10},
        {"name": "Delivery", "itemType": "SERVICE", "openingStock": 0, "minStockQuantity": 5},
    ]

    result = summarize_stock(items)

    assert "Low-stock items (1)" in result
    assert "Flour" in result
    assert "Sugar" not in result
    assert "Delivery" not in result


def test_summarize_stock_empty() -> None:
    assert summarize_stock([]) == "No low-stock items found."
    assert summarize_stock([{"name": "X"}]) == "No low-stock items found."
