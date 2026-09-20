"""Graph tests — reply extraction + compile smoke test (no LLM calls)."""

import pytest
from langchain_core.messages import AIMessage, HumanMessage

from ai.core.config import get_settings
from ai.modules.chat.graph import build_graph, checkpoint_key, extract_reply, polish_reply


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


def test_polish_reply_repairs_mojibake() -> None:
    # U+00E2 U+0080 U+00AF is U+202F (narrow no-break space) misdecoded as latin-1.
    raw = "Last 30" + chr(0xE2) + chr(0x80) + chr(0xAF) + "days"
    assert polish_reply(raw) == "Last 30" + chr(0x202F) + "days"


def test_polish_reply_hides_tool_names() -> None:
    assert polish_reply("I checked get_sales_summary for you") == "I checked sales records for you"


def test_polish_reply_leaves_plain_text_alone() -> None:
    assert polish_reply("Total is 1500.") == "Total is 1500."


def test_checkpoint_key_isolates_owner() -> None:
    mine = checkpoint_key("user-1", "company-1", "thread-123")

    assert mine != "thread-123"
    assert mine != checkpoint_key("user-2", "company-1", "thread-123")
    assert mine != checkpoint_key("user-1", "company-2", "thread-123")


def test_build_graph_compiles_without_llm_call(monkeypatch: pytest.MonkeyPatch) -> None:
    # Construction validates the key but makes no network calls.
    monkeypatch.setenv("LLM_API_KEY", "test-key")
    get_settings.cache_clear()
    try:
        graph = build_graph("test-token", "company-1")
    finally:
        get_settings.cache_clear()

    assert hasattr(graph, "ainvoke")
