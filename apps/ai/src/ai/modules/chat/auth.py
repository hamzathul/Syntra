"""Chat auth — per-request `Depends()` (genuinely per-request construction).

Mirrors ERP: no JWT secret here. The Bearer token is validated by calling
Core `GET /api/v1/auth/me`, and company membership is verified via
ERP `GET /api/v1/companies` (avoids a second DB in the AI service).
"""

from dataclasses import dataclass

import httpx
import structlog
from fastapi import Request

from ai.core.config import get_settings
from ai.core.errors import (
    BadRequestError,
    ForbiddenError,
    InternalServerError,
    UnauthorizedError,
)

log = structlog.get_logger(__name__)

_TIMEOUT_SECONDS = 5.0


@dataclass
class ChatAuth:
    user_id: str
    bearer_token: str
    company_id: str


def _bearer_token(request: Request) -> str:
    header = request.headers.get("authorization", "")
    if not header.startswith("Bearer ") or len(header) <= 7:
        raise UnauthorizedError("Missing authorization header")
    return header[7:]


async def get_chat_auth(request: Request) -> ChatAuth:
    """Validate identity via Core, membership via ERP. Raises 401/403/400."""
    settings = get_settings()
    token = _bearer_token(request)

    async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
        try:
            me = await client.get(
                f"{settings.CORE_API_URL}/api/v1/auth/me",
                headers={"Authorization": f"Bearer {token}"},
            )
        except httpx.HTTPError as exc:
            log.warn("chat auth core unreachable", error=str(exc))
            raise InternalServerError("Authentication service is unavailable") from exc
        if me.status_code != 200:
            log.warn("chat auth rejected", status_code=me.status_code)
            raise UnauthorizedError("Invalid or expired token")
        try:
            user_id = str(me.json()["data"]["id"])
        except (KeyError, TypeError, ValueError) as exc:
            log.warn("chat auth bad core payload", error=str(exc))
            raise UnauthorizedError("Invalid or expired token") from exc

        company_id = request.headers.get("x-company-id", "").strip()
        if not company_id:
            raise BadRequestError("X-Company-Id header is required")

        try:
            companies = await client.get(
                f"{settings.ERP_API_URL}/api/v1/companies",
                headers={"Authorization": f"Bearer {token}"},
            )
        except httpx.HTTPError as exc:
            log.warn("chat company check unreachable", error=str(exc))
            raise InternalServerError("Company service is unavailable") from exc

    if companies.status_code != 200:
        log.warn("chat company check rejected", status_code=companies.status_code)
        raise UnauthorizedError("Invalid or expired token")
    try:
        ids = {str(c["id"]) for c in companies.json()["data"]}
    except (KeyError, TypeError, ValueError) as exc:
        log.warn("chat company bad erp payload", error=str(exc))
        raise InternalServerError("Company service returned an invalid response") from exc

    if company_id not in ids:
        log.warn("chat company denied", user_id=user_id, company_id=company_id)
        raise ForbiddenError("You are not a member of this company")

    return ChatAuth(user_id=user_id, bearer_token=token, company_id=company_id)
