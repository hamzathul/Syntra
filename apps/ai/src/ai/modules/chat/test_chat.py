"""Chat endpoint tests — echo path (no LLM key) behind the auth gate (overridden here)."""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from ai.core.config import get_settings
from ai.main import create_app
from ai.modules.chat.auth import ChatAuth, get_chat_auth


@pytest.fixture()
def authed_client(monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient, None, None]:
    # Force the echo path: empty key wins over both env AND the local `.env` file.
    monkeypatch.setenv("LLM_API_KEY", "")
    get_settings.cache_clear()
    app = create_app()

    async def _fake_auth() -> ChatAuth:
        return ChatAuth(user_id="user-1", bearer_token="test-token", company_id="company-1")

    app.dependency_overrides[get_chat_auth] = _fake_auth
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
    get_settings.cache_clear()


def test_post_chat_echoes_message(authed_client: TestClient) -> None:
    response = authed_client.post(
        "/api/v1/chat",
        json={"message": "sales last month?"},
        headers={"Authorization": "Bearer test-token", "X-Company-Id": "company-1"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["data"]["reply"] == "Echo: sales last month?"
    assert body["data"]["thread_id"]
    assert body["data"]["tool_calls"] == []


def test_post_chat_reuses_thread_id(authed_client: TestClient) -> None:
    response = authed_client.post(
        "/api/v1/chat",
        json={"message": "hi", "thread_id": "thread-123"},
        headers={"Authorization": "Bearer test-token", "X-Company-Id": "company-1"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["thread_id"] == "thread-123"


def test_post_chat_rejects_empty_message(authed_client: TestClient) -> None:
    response = authed_client.post(
        "/api/v1/chat",
        json={"message": ""},
        headers={"Authorization": "Bearer test-token", "X-Company-Id": "company-1"},
    )

    assert response.status_code == 422
    assert response.json()["status"] == "error"


def test_post_chat_requires_auth() -> None:
    with TestClient(create_app(), raise_server_exceptions=False) as client:
        response = client.post("/api/v1/chat", json={"message": "hi"})

    assert response.status_code == 401
    assert response.json()["status"] == "error"
