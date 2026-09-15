"""Health endpoint tests — co-located with source, mirroring `*.test.ts` convention."""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from ai.main import create_app


@pytest.fixture(scope="module")
def client() -> Iterator[TestClient]:
    with TestClient(create_app()) as test_client:
        yield test_client


def test_health_returns_v1_success_envelope(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["message"] == "Service healthy"
    assert body["data"] == {"status": "ok"}
    assert body["meta"]["version"] == "v1"
    assert body["meta"]["timestamp"]
    assert response.headers["x-request-id"]


def test_health_propagates_incoming_request_id(client: TestClient) -> None:
    response = client.get("/health", headers={"x-request-id": "test-123"})

    assert response.status_code == 200
    assert response.headers["x-request-id"] == "test-123"
    assert response.json()["meta"]["requestId"] == "test-123"


def test_unknown_route_returns_v1_error_envelope(client: TestClient) -> None:
    response = client.get("/does-not-exist")

    assert response.status_code == 404
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "NOT_FOUND"
    assert body["meta"]["version"] == "v1"
