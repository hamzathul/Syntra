"""App entry — mirrors `apps/erp/src/index.ts` middleware ordering.

Flow (outermost → innermost): CORS → request-id → access log → routes.
Note: Starlette runs the LAST-added middleware FIRST, so `add_middleware`
calls below are in reverse flow order.

Deliberately NO request-timeout middleware: `asyncio.wait_for` around ASGI
`call_next` cannot reliably cancel downstream work and produces noisy
cancellations. Timeouts belong at the server/gateway layer (uvicorn worker
timeouts, proxy `timeout` settings) — see README.
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ai.api.router import root_router
from ai.core.config import Settings, get_settings
from ai.core.errors import register_exception_handlers
from ai.core.logging import configure_logging
from ai.middlewares.request_id import RequestIdMiddleware
from ai.middlewares.request_log import RequestLogMiddleware

log = structlog.get_logger(__name__)


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(level=settings.LOG_LEVEL, json_format=settings.is_production)

    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
        log.info("ai server started", port=settings.PORT, env=settings.ENVIRONMENT)
        yield
        log.info("ai server stopped")

    app = FastAPI(
        title="Syntra AI",
        version="0.1.0",
        lifespan=lifespan,
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None if settings.is_production else "/redoc",
        openapi_url=None if settings.is_production else "/openapi.json",
    )

    # Reverse flow order (last added runs first): CORS → request-id → access log.
    app.add_middleware(RequestLogMiddleware)
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        # Browsers reject credentialed wildcard CORS — credentials only for explicit origins.
        allow_credentials=settings.cors_origins != ["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(root_router)
    register_exception_handlers(app, is_production=settings.is_production)
    return app


app = create_app()


def run() -> None:
    """Local entry (`uvicorn ai.main:app` targets the module-level `app`)."""
    settings = get_settings()
    uvicorn.run(
        "ai.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=not settings.is_production,
    )


if __name__ == "__main__":
    run()
