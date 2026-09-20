"""Versioned API router — domain routers mount here (`/v1` exactly once)."""

from fastapi import APIRouter

from ai.modules.chat.router import router as chat_router

v1_router = APIRouter(prefix="/api/v1", tags=["v1"])
v1_router.include_router(chat_router)
