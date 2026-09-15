"""Versioned API router — future domain routers (chat, threads) mount here."""

from fastapi import APIRouter

v1_router = APIRouter(prefix="/api/v1", tags=["v1"])
