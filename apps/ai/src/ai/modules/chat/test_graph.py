"""Graph tests — reply extraction + compile smoke test (no LLM calls)."""

import pytest
from langchain_core.messages import AIMessage, HumanMessage

from ai.core.config import get_settings
from ai.modules.chat.graph import build_graph, extract_reply


def test_extract_reply_picks_last_text_and_tool_names() -> None:
    messages = [
        HumanMessage(content="sales?"),
        AIMessage(
            content="",
            tool_calls=[{"name": "get_sales_summary", "args": {}, "id": "1", "type": "tool_call"}],
        ),
        AIMessage(content="Total is 1500."),
    ]

    reply, used = extract_reply(messages)

    assert reply == "Total is 1500."
    assert used == ["get_sales_summary"]


def test_extract_reply_empty() -> None:
    reply, used = extract_reply([])

    assert "could not finish" in reply
    assert used == []


def test_build_graph_compiles_without_llm_call(monkeypatch: pytest.MonkeyPatch) -> None:
    # Construction validates the key but makes no network calls.
    monkeypatch.setenv("LLM_API_KEY", "test-key")
    get_settings.cache_clear()
    try:
        graph = build_graph("test-token", "company-1")
    finally:
        get_settings.cache_clear()

    assert hasattr(graph, "ainvoke")
