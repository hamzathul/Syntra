"""Root router — public `/health` mounts BEFORE `/api` (unauthenticated, like Node)."""

from fastapi import APIRouter

from ai.api.v1.router import v1_router
from ai.modules.health.router import router as health_router

root_router = APIRouter()
root_router.include_router(health_router)
root_router.include_router(v1_router)
