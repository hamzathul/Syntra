"""Chat graph — the LangGraph ReAct loop.

Shape: `START → agent ⇄ tools → END`.
* `agent` — `ChatOpenAI.bind_tools(tools)` over `[SystemMessage] + history`.
  The system prompt is injected per step so stored history stays clean
  (human/ai/tool only).
* `tools` — `ToolNode` executes whatever the model requested.
* `should_continue` — last `AIMessage` has `tool_calls` → loop, else finish.

Memory: module-level `MemorySaver` shared by every per-request compilation,
keyed by `thread_id`. In-memory = lost on restart and requires a single
uvicorn worker (a Postgres checkpointer is the future upgrade path).
"""

from datetime import date
from typing import Any, Literal

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from pydantic import SecretStr

from ai.core.config import get_settings
from ai.modules.chat.tools.erp_cash import build_cash_tool
from ai.modules.chat.tools.erp_overdue import build_overdue_tool
from ai.modules.chat.tools.erp_sales import build_sales_summary_tool
from ai.modules.chat.tools.erp_stock import build_low_stock_tool


def _system_prompt() -> str:
    today = date.today().isoformat()
    return (
        f"Today is {today}. "
        "You are Syntra, a business assistant for a shop owner — you ONLY help "
        "with this shop: sales, stock, parties/receivables, and cash/bank balances. "
        "For anything outside that (coding, general knowledge, homework, other topics), "
        "decline in one friendly line and offer what you can do instead — "
        "never answer out-of-scope questions, not even briefly. "
        "Speak plain business language with currency amounts. "
        "Use a data tool for every sales, stock, receivables, or cash question — "
        "the tool matching the question, not all of them — "
        "and call it again for each new question instead of reusing earlier results, "
        "the data changes. "
        "If the message is just a greeting or small talk, reply with one warm line "
        "plus one short offer to help with the business — never summarize, list, "
        "or comment on the conversation history. "
        "Format answers for chat: short, markdown with **bold** key amounts, "
        "bullets for lists, no emoji. "
        "Never mention tool names, APIs, or technical internals. "
        "Never talk about your tools, capabilities, systems, or limitations — "
        "no 'my tools', 'my capabilities', 'I don't have access', or excuses about "
        "what systems you can reach. If you cannot do something, just say what "
        "you CAN check instead, in plain words. "
        "Never say you lack access to data or tools; you have live tools. "
        "If a tool reports an error, say that information is temporarily unavailable."
    )


_RECURSION_LIMIT = 10  # ≈ 5 agent↔tool rounds.

# The only cross-request state: conversation history by thread_id.
_checkpointer = MemorySaver()


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


def build_graph(bearer_token: str, company_id: str) -> Any:
    """Compile a per-request graph (fresh tools bound to this caller).

    Compiling per request is cheap (no I/O) and keeps credentials out of
    module state; the shared `_checkpointer` is what preserves history.
    """
    tools = [
        build_sales_summary_tool(bearer_token, company_id),
        build_low_stock_tool(bearer_token, company_id),
        build_overdue_tool(bearer_token, company_id),
        build_cash_tool(bearer_token, company_id),
    ]
    model = _build_model().bind_tools(tools)

    async def agent_node(state: MessagesState) -> dict[str, Any]:
        prompt = SystemMessage(content=_system_prompt())
        response = await model.ainvoke([prompt, *state["messages"]])
        return {"messages": [response]}

    def should_continue(state: MessagesState) -> Literal["tools", "__end__"]:
        last = state["messages"][-1]
        if isinstance(last, AIMessage) and last.tool_calls:
            return "tools"
        return "__end__"

    builder = StateGraph(MessagesState)
    builder.add_node("agent", agent_node)
    builder.add_node("tools", ToolNode(tools))
    builder.add_edge(START, "agent")
    builder.add_conditional_edges("agent", should_continue)
    builder.add_edge("tools", "agent")
    return builder.compile(checkpointer=_checkpointer)


_TOOL_NAME_FALLBACKS = {
    "get_sales_summary": "sales records",
    "list_low_stock_items": "stock levels",
    "list_overdue_parties": "receivables",
    "get_cash_balance": "cash and bank balances",
}


def _repair_mojibake(text: str) -> str:
    """Fix UTF-8-decoded-as-latin-1 artifacts some providers emit.

    Only applies when the whole string round-trips cleanly, so genuine
    non-ASCII text (accents, other scripts, emoji) passes through untouched.
    """
    try:
        return text.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return text


def polish_reply(reply: str) -> str:
    """User-facing cleanup: repair encoding artifacts, hide tool internals."""
    fixed = _repair_mojibake(reply)
    for name, fallback in _TOOL_NAME_FALLBACKS.items():
        fixed = fixed.replace(name, fallback)
    return fixed


def extract_reply(messages: list[Any]) -> tuple[str, list[str]]:
    """Last AI text + every tool name requested along the way."""
    used: list[str] = []
    for message in messages:
        if isinstance(message, AIMessage) and message.tool_calls:
            used.extend(
                call.get("name", "") for call in message.tool_calls if isinstance(call, dict)
            )
    reply = "I could not finish that, please try again."
    for message in reversed(messages):
        if isinstance(message, AIMessage) and isinstance(message.content, str) and message.content:
            reply = message.content
            break
    return reply, used


def checkpoint_key(user_id: str, company_id: str, thread_id: str) -> str:
    """Namespace stored history by owner: a raw thread id alone opens nothing."""
    return f"{user_id}:{company_id}:{thread_id}"


async def run_agent(
    message: str, thread_id: str, bearer_token: str, company_id: str, user_id: str
) -> tuple[str, list[str]]:
    """Build the caller's graph, run it against their thread, extract the reply."""
    graph = build_graph(bearer_token, company_id)
    result = await graph.ainvoke(
        {"messages": [HumanMessage(content=message)]},
        config={
            "configurable": {"thread_id": checkpoint_key(user_id, company_id, thread_id)},
            "recursion_limit": _RECURSION_LIMIT,
        },
    )
    messages = result["messages"] if isinstance(result, dict) else []
    reply, used = extract_reply(messages if isinstance(messages, list) else [])
    return polish_reply(reply), used
