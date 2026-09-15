"""Logging setup — configure once at startup, then log directly with structlog.

Standard pattern (per structlog docs): every module does
`log = structlog.get_logger(__name__)` and logs with keyword context.
No port/adapter layer — structlog *is* the interface. Request correlation
comes from contextvars bound in `RequestIdMiddleware` (see `merge_contextvars`).
"""

import logging
import sys

import structlog

_configured = False


def configure_logging(*, level: str = "info", json_format: bool = False) -> None:
    """Idempotent structlog setup. Called once from `create_app` — nowhere else."""
    global _configured
    if _configured:
        return
    # Accept the same level names as the Node services; map the two stdlib lacks.
    mapped = {"trace": "debug", "fatal": "critical"}.get(level, level)
    std_level = getattr(logging, mapped.upper(), logging.INFO)
    logging.basicConfig(level=std_level, format="%(message)s", stream=sys.stdout)
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer()
            if json_format
            else structlog.dev.ConsoleRenderer(colors=False),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(std_level),
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )
    _configured = True
