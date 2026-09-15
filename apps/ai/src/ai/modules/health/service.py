"""Health checks — plain functions, no HTTP concepts (`Request` never appears here)."""

import structlog

from ai.modules.health.schemas import HealthData

log = structlog.get_logger(__name__)


def get_health_status() -> HealthData:
    log.debug("health check", action="health.check")
    # Future: `SELECT 1` against the checkpointer DB; raise `AppError(503, ...)` on
    # failure so the route returns 503 HEALTH_CHECK_FAILED. Keep sync until then.
    return HealthData(status="ok")
