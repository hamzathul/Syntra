"""ERP helper tests — error mapping; `httpx.get` is monkeypatched."""

import httpx
import pytest

from ai.modules.chat.tools._erp import ErpError, erp_get


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
