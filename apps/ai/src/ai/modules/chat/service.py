"""Chat service — plain functions, no HTTP concepts (`Request` never appears here).

M2: echo fallback when no LLM key is configured, otherwise a manual
`bind_tools` loop (no graph yet — that's M3) with the ERP sales tool.
"""

import uuid
from typing import Any

import structlog
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import SecretStr

from ai.core.config import get_settings
from ai.core.errors import InternalServerError
from ai.modules.chat.auth import ChatAuth
from ai.modules.chat.schemas import ChatRequest, ChatResponse
from ai.modules.chat.tools.erp_sales import build_sales_summary_tool

log = structlog.get_logger(__name__)

_SYSTEM_PROMPT = (
    "You are Syntra, a company-scoped ERP assistant. "
    "Never invent numbers — always call get_sales_summary for sales questions. "
    "If a tool reports an error, relay it honestly. Keep replies short."
)
_MAX_ITERATIONS = 5


def _build_model() -> ChatOpenAI:
    settings = get_settings()
    headers = {"X-Title": settings.LLM_APP_TITLE}
    if settings.LLM_APP_URL:
        headers["HTTP-Referer"] = settings.LLM_APP_URL
    return ChatOpenAI(
        api_key=SecretStr(settings.LLM_API_KEY),
        base_url=settings.LLM_BASE_URL,
        model=settings.LLM_MODEL,
        default_headers=headers,
    )


async def handle_chat(payload: ChatRequest, auth: ChatAuth) -> ChatResponse:
    thread_id = payload.thread_id or str(uuid.uuid4())
    settings = get_settings()

    # No key (tests, local dev): stay on the echo path, auth already verified.
    if not settings.LLM_API_KEY:
        log.debug("chat echo", action="chat.echo", thread_id=thread_id)
        return ChatResponse(
            reply=f"Echo: {payload.message}",
            thread_id=thread_id,
            tool_calls=[],
        )

    sales_tool = build_sales_summary_tool(auth.bearer_token, auth.company_id)
    model = _build_model().bind_tools([sales_tool])
    messages: list[Any] = [
        SystemMessage(content=_SYSTEM_PROMPT),
        HumanMessage(content=payload.message),
    ]
    used_tools: list[str] = []

    try:
        for _ in range(_MAX_ITERATIONS):
            response = await model.ainvoke(messages)
            messages.append(response)
            calls = getattr(response, "tool_calls", None) or []
            if not calls:
                text = (
                    response.content if isinstance(response.content, str) else str(response.content)
                )
                return ChatResponse(reply=text, thread_id=thread_id, tool_calls=used_tools)
            for call in calls:
                name = call.get("name", "")
                used_tools.append(name)
                try:
                    result = await sales_tool.ainvoke(call)
                except Exception as exc:
                    log.warn("chat tool failed", tool=name, error=str(exc))
                    result = "Tool failed, answer from what you know and say so."
                messages.append(result)
    except Exception as exc:
        log.error("chat llm failed", error=str(exc))
        raise InternalServerError("Assistant is temporarily unavailable") from exc

    log.warn("chat max iterations", thread_id=thread_id)
    last = messages[-1]
    text = getattr(last, "content", "I could not finish that, please try again.")
    return ChatResponse(
        reply=text if isinstance(text, str) else str(text),
        thread_id=thread_id,
        tool_calls=used_tools,
    )
