"""X-Request-ID propagation + structlog correlation.

Keeps an incoming ID when present, generates UUIDv4 otherwise, echoes it back
on the response, and binds it into structlog contextvars so every log line in
the request scope carries `request_id` automatically.
"""

import uuid

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from structlog import contextvars

REQUEST_ID_HEADER = "x-request-id"


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        incoming = request.headers.get(REQUEST_ID_HEADER, "").strip()
        request_id = incoming or str(uuid.uuid4())
        request.state.request_id = request_id
        contextvars.bind_contextvars(request_id=request_id)
        try:
            response = await call_next(request)
        finally:
            # Unbind only our key — a blanket clear would drop vars bound
            # downstream in the same scope (e.g. a future `user_id`).
            contextvars.unbind_contextvars("request_id")
        response.headers[REQUEST_ID_HEADER] = request_id
        return response
