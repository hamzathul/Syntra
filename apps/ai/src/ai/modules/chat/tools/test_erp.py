"""ERP helper tests — error mapping + cursor pagination; `httpx.get` is monkeypatched."""

import httpx
import pytest

from ai.modules.chat.tools._erp import ErpError, erp_get, erp_get_all


def _request() -> httpx.Request:
    return httpx.Request("GET", "http://test/api/v1/sales")


def test_erp_get_returns_envelope_data(monkeypatch: pytest.MonkeyPatch) -> None:
    def _fake_get(*args: object, **kwargs: object) -> httpx.Response:
        return httpx.Response(200, json={"data": {"items": []}}, request=_request())

    monkeypatch.setattr(httpx, "get", _fake_get)

    assert erp_get("/api/v1/sales", "token", "company-1", label="sales") == {"items": []}


def test_erp_get_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    def _fake_get(*args: object, **kwargs: object) -> httpx.Response:
        return httpx.Response(403, json={}, request=_request())

    monkeypatch.setattr(httpx, "get", _fake_get)

    with pytest.raises(ErpError, match="rejected"):
        erp_get("/api/v1/sales", "token", "company-1", label="sales")


def test_erp_get_unreachable(monkeypatch: pytest.MonkeyPatch) -> None:
    def _fake_get(*args: object, **kwargs: object) -> httpx.Response:
        raise httpx.ConnectError("refused")

    monkeypatch.setattr(httpx, "get", _fake_get)

    with pytest.raises(ErpError, match="unreachable"):
        erp_get("/api/v1/sales", "token", "company-1", label="sales")


def test_erp_get_bad_payload(monkeypatch: pytest.MonkeyPatch) -> None:
    def _fake_get(*args: object, **kwargs: object) -> httpx.Response:
        return httpx.Response(200, json={"status": "success"}, request=_request())

    monkeypatch.setattr(httpx, "get", _fake_get)

    with pytest.raises(ErpError, match="unexpected response"):
        erp_get("/api/v1/sales", "token", "company-1", label="sales")


def _page(items: list[object], cursor: str | None) -> httpx.Response:
    return httpx.Response(
        200,
        json={"data": {"items": items, "meta": {"nextCursor": cursor}}},
        request=_request(),
    )


def test_erp_get_all_follows_cursor(monkeypatch: pytest.MonkeyPatch) -> None:
    def _fake_get(*args: object, **kwargs: object) -> httpx.Response:
        params = kwargs.get("params")
        assert isinstance(params, dict)
        if params.get("cursor") == "page-2":
            return _page([{"id": "3"}], None)
        assert "cursor" not in params
        return _page([{"id": "1"}, {"id": "2"}], "page-2")

    monkeypatch.setattr(httpx, "get", _fake_get)

    items, complete = erp_get_all("/api/v1/sales", "token", "company-1", label="sales")

    assert [item["id"] for item in items] == ["1", "2", "3"]
    assert complete is True


def test_erp_get_all_stops_at_max_pages(monkeypatch: pytest.MonkeyPatch) -> None:
    def _fake_get(*args: object, **kwargs: object) -> httpx.Response:
        return _page([{"id": "x"}], "always-more")

    monkeypatch.setattr(httpx, "get", _fake_get)

    items, complete = erp_get_all("/api/v1/sales", "token", "company-1", label="sales")

    assert len(items) == 5  # 5 pages × 1 item, then the cap stops paging
    assert complete is False
