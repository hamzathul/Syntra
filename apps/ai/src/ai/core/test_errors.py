"""Error-path tests — envelope shape + request-id correlation on failures."""

from fastapi.testclient import TestClient

from ai.main import create_app


def _client_with_crash() -> TestClient:
    app = create_app()

    @app.get("/kaboom")
    def _kaboom() -> None:
        raise RuntimeError("unexpected failure")

    # raise_server_exceptions=False so the 500 envelope (not the exception) is returned.
    return TestClient(app, raise_server_exceptions=False)


def test_unexpected_error_returns_envelope_with_request_id_header() -> None:
    with _client_with_crash() as client:
        response = client.get("/kaboom")

    assert response.status_code == 500
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "INTERNAL_SERVER_ERROR"
    # Header must match the body: it previously went missing here because the
    # exception skipped the middleware line that sets it (now set in handlers).
    assert response.headers["x-request-id"] == body["meta"]["requestId"]


def test_handled_error_keeps_request_id_header() -> None:
    with _client_with_crash() as client:
        response = client.get("/does-not-exist")

    assert response.status_code == 404
    assert response.headers["x-request-id"] == response.json()["meta"]["requestId"]
