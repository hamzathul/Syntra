"""Chat endpoint tests — echo slice; LLM/tools arrive in M2/M3."""

from collections.abc import Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from ai.main import create_app


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(create_app()) as client:
        yield client


def test_post_chat_echoes_message(client: TestClient) -> None:
    response = client.post("/api/v1/chat", json={"message": "sales last month?"})

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["data"]["reply"] == "Echo: sales last month?"
    assert body["data"]["thread_id"]
    assert body["data"]["tool_calls"] == []


def test_post_chat_reuses_thread_id(client: TestClient) -> None:
    response = client.post("/api/v1/chat", json={"message": "hi", "thread_id": "thread-123"})

    assert response.status_code == 200
    assert response.json()["data"]["thread_id"] == "thread-123"


def test_post_chat_rejects_empty_message(client: TestClient) -> None:
    app: FastAPI = create_app()
    with TestClient(app, raise_server_exceptions=False) as no_raise:
        response = no_raise.post("/api/v1/chat", json={"message": ""})

    assert response.status_code == 422
    assert response.json()["status"] == "error"
