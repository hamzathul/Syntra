"""V1 envelope models — same wire shape as `packages/shared/src/api/response.ts`.

Success responses go through FastAPI `response_model`, so OpenAPI stays truthful
and serialization/validation are framework-owned. Only error paths (exception
handlers, which must return a `Response`) use the `error_envelope()` builder.
"""

from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Any, Literal

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field


class Meta(BaseModel):
    requestId: str | None = None
    timestamp: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())
    version: Literal["v1"] = "v1"


class SuccessEnvelope[T](BaseModel):
    status: Literal["success"] = "success"
    message: str
    data: T
    meta: Meta = Field(default_factory=Meta)


class ErrorDetail(BaseModel):
    code: str
    message: str
    path: str | None = None


class StackFrame(BaseModel):
    fn: str
    file: str
    line: int
    col: int


class ErrorDebug(BaseModel):
    name: str
    stack: list[StackFrame] = Field(default_factory=list)


class ErrorContent(BaseModel):
    code: str
    details: list[ErrorDetail] | None = None


class ErrorEnvelope(BaseModel):
    status: Literal["error"] = "error"
    message: str
    error: ErrorContent
    meta: Meta = Field(default_factory=Meta)
    debug: ErrorDebug | None = None


def request_id_from(request: Request) -> str | None:
    """Request ID bound by `RequestIdMiddleware` (`None` only if it never ran)."""
    return getattr(request.state, "request_id", None)


def success_envelope(message: str, data: Any, request: Request) -> SuccessEnvelope[Any]:
    """Convenience for routes — keeps the `meta.requestId` wiring in one place."""
    return SuccessEnvelope(
        message=message, data=data, meta=Meta(requestId=request_id_from(request))
    )


def error_envelope(
    *,
    message: str,
    code: str,
    request_id: str | None = None,
    status_code: int = 500,
    details: Sequence[ErrorDetail] | None = None,
    debug: ErrorDebug | None = None,
) -> JSONResponse:
    """Build a V1 error response — used only inside exception handlers.

    Echoes `x-request-id` on the response itself: exceptions propagate through
    `RequestIdMiddleware` without returning, so the middleware never gets to set
    the header on error paths (only the body would otherwise carry `requestId`).
    """
    body = ErrorEnvelope(
        message=message,
        error=ErrorContent(code=code, details=list(details) if details else None),
        meta=Meta(requestId=request_id),
        debug=debug,
    )
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(exclude_none=True),
        headers={"x-request-id": request_id} if request_id else None,
    )
