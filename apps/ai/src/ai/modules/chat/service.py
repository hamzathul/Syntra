"""Chat service — plain functions, no HTTP concepts (`Request` never appears here).

M1 is an echo placeholder so the HTTP slice (router → service → envelope)
can be verified before any LLM is wired in M2/M3.
"""

import uuid

import structlog

from ai.modules.chat.schemas import ChatRequest, ChatResponse

log = structlog.get_logger(__name__)


def handle_chat(payload: ChatRequest) -> ChatResponse:
    thread_id = payload.thread_id or str(uuid.uuid4())
    log.debug("chat echo", action="chat.echo", thread_id=thread_id)
    return ChatResponse(
        reply=f"Echo: {payload.message}",
        thread_id=thread_id,
        tool_calls=[],
    )
