"""Health routes — thin adapters: call the service, wrap in the V1 envelope."""

from fastapi import APIRouter, Request

from ai.core.envelope import SuccessEnvelope, success_envelope
from ai.modules.health.schemas import HealthData
from ai.modules.health.service import get_health_status

router = APIRouter(tags=["health"])


# exclude_none keeps this consistent with the error path (`exclude_none=True`
# in `error_envelope`): an absent requestId is omitted, never serialized as null.
@router.get("/health", response_model=SuccessEnvelope[HealthData], response_model_exclude_none=True)
def get_health(request: Request) -> SuccessEnvelope[HealthData]:
    return success_envelope("Service healthy", get_health_status(), request)
