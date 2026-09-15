"""Operational errors + handlers — mirrors backend-p `errors/` semantics.

Conventions:
* Raise `AppError` subclasses from services. Never catch-and-log at the call site.
* `register_exception_handlers` is the single error-logging point.
* Non-prod responses include parsed `debug` frames; prod omits them.
"""

import traceback
from collections.abc import Sequence

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from ai.core.envelope import ErrorDebug, ErrorDetail, StackFrame, error_envelope

log = structlog.get_logger(__name__)


class AppError(Exception):
    """Base operational error — `status_code`/`code`/`message` + optional details."""

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Sequence[ErrorDetail] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = list(details) if details else None


class BadRequestError(AppError):
    def __init__(
        self, message: str = "Bad request", details: Sequence[ErrorDetail] | None = None
    ) -> None:
        super().__init__(400, "BAD_REQUEST", message, details)


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Authentication is required") -> None:
        super().__init__(401, "UNAUTHORIZED", message)


class ForbiddenError(AppError):
    def __init__(self, message: str = "You do not have permission to access this resource") -> None:
        super().__init__(403, "FORBIDDEN", message)


class ValidationError(AppError):
    def __init__(self, details: Sequence[ErrorDetail]) -> None:
        super().__init__(422, "VALIDATION_ERROR", "Request validation failed", details)


class ConflictError(AppError):
    def __init__(self, message: str = "Resource already exists") -> None:
        super().__init__(409, "CONFLICT", message)


class NotFoundError(AppError):
    def __init__(self, resource: str = "Resource") -> None:
        super().__init__(404, "NOT_FOUND", f"{resource} was not found")


class InternalServerError(AppError):
    def __init__(self, message: str = "Internal server error") -> None:
        super().__init__(500, "INTERNAL_SERVER_ERROR", message)


def parse_stack(err: BaseException) -> ErrorDebug:
    """Parsed frames (fn/file/line) — mirrors backend-p `parseStack`."""
    return ErrorDebug(
        name=type(err).__name__,
        stack=[
            StackFrame(fn=frame.name, file=frame.filename, line=frame.lineno or 0, col=0)
            for frame in traceback.extract_tb(err.__traceback__)
        ],
    )


def _request_id(request: Request) -> str | None:
    return getattr(request.state, "request_id", None)


def _fallback_code(status_code: int) -> str:
    return {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        422: "VALIDATION_ERROR",
    }.get(status_code, "INTERNAL_SERVER_ERROR")


def _fallback_message(status_code: int) -> str:
    return {
        400: "Bad request",
        401: "Authentication is required",
        403: "You do not have permission to access this resource",
        404: "Resource was not found",
        409: "Resource already exists",
        422: "Request validation failed",
    }.get(status_code, "Something went wrong")


def _log_error(request: Request, err: BaseException, message: str) -> None:
    # request_id is also attached via contextvars — included explicitly for grep-ability.
    log.error(
        message,
        request_id=_request_id(request),
        method=request.method,
        path=request.url.path,
        error_name=type(err).__name__,
        exc_info=err,
    )


def register_exception_handlers(app: FastAPI, *, is_production: bool) -> None:
    """Attach envelope handlers. Called once in `create_app`."""

    @app.exception_handler(AppError)
    async def _handle_app_error(request: Request, err: AppError) -> JSONResponse:
        _log_error(request, err, err.message)
        return error_envelope(
            message=err.message,
            code=err.code,
            request_id=_request_id(request),
            status_code=err.status_code,
            details=err.details,
            debug=parse_stack(err) if not is_production else None,
        )

    @app.exception_handler(RequestValidationError)
    async def _handle_validation(request: Request, err: RequestValidationError) -> JSONResponse:
        details = [
            ErrorDetail(
                code=str(item.get("type", "value_error")),
                message=str(item.get("msg", "Invalid value")),
                path=".".join(str(p) for p in item.get("loc", ()) if str(p) != "body") or None,
            )
            for item in err.errors()
        ]
        _log_error(request, err, "Request validation failed")
        return error_envelope(
            message="Request validation failed",
            code="VALIDATION_ERROR",
            request_id=_request_id(request),
            status_code=422,
            details=details,
            debug=parse_stack(err) if not is_production else None,
        )

    @app.exception_handler(StarletteHTTPException)
    async def _handle_http(request: Request, err: StarletteHTTPException) -> JSONResponse:
        # Covers router 404s (the notFoundHandler equivalent) and auth rejections.
        # Never echo `err.detail` publicly — it can carry framework/internal
        # strings. Internal detail stays in logs via `exc_info`.
        message = _fallback_message(err.status_code)
        _log_error(request, err, message)
        return error_envelope(
            message=message,
            code=_fallback_code(err.status_code),
            request_id=_request_id(request),
            status_code=err.status_code,
            debug=parse_stack(err) if not is_production else None,
        )

    @app.exception_handler(Exception)
    async def _handle_unexpected(request: Request, err: Exception) -> JSONResponse:
        _log_error(request, err, "Something went wrong")
        return error_envelope(
            message="Something went wrong",
            code="INTERNAL_SERVER_ERROR",
            request_id=_request_id(request),
            status_code=500,
            debug=parse_stack(err) if not is_production else None,
        )
