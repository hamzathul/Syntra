"""Chat service — plain functions, no HTTP concepts (`Request` never appears here).

Echo fallback when no LLM key is configured (tests, local dev); otherwise
the LangGraph ReAct agent (`graph.run_agent`) with ERP tools and thread memory.
"""

import uuid

import structlog

from ai.core.config import get_settings
from ai.core.errors import InternalServerError
from ai.modules.chat.auth import ChatAuth
from ai.modules.chat.graph import run_agent
from ai.modules.chat.schemas import ChatRequest, ChatResponse

log = structlog.get_logger(__name__)


async def handle_chat(payload: ChatRequest, auth: ChatAuth) -> ChatResponse:
    thread_id = payload.thread_id or str(uuid.uuid4())
    settings = get_settings()

    # No key: echo only outside production (tests, local dev). Production
    # without a key is a misconfiguration — fail loudly, never fake a reply.
    if not settings.LLM_API_KEY:
        if settings.is_production:
            raise InternalServerError("Assistant is temporarily unavailable")
        log.debug("chat echo", action="chat.echo", thread_id=thread_id)
        return ChatResponse(
            reply=f"Echo: {payload.message}",
            thread_id=thread_id,
            tool_calls=[],
        )

    try:
        reply, used_tools = await run_agent(
            payload.message, thread_id, auth.bearer_token, auth.company_id, auth.user_id
        )
    except Exception as exc:
        # Logged once by the global error handler — don't log here too.
        raise InternalServerError("Assistant is temporarily unavailable") from exc
    return ChatResponse(reply=reply, thread_id=thread_id, tool_calls=used_tools)
