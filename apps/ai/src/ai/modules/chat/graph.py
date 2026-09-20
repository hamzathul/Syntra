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

_SYSTEM_PROMPT = (
    "You are Syntra, a company-scoped ERP assistant. "
    "Never invent numbers — always call a tool for sales, stock, "
    "receivables, or cash questions. If a tool reports an error, relay it "
    "honestly. Keep replies short."
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
        response = await model.ainvoke([SystemMessage(content=_SYSTEM_PROMPT), *state["messages"]])
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


async def run_agent(
    message: str, thread_id: str, bearer_token: str, company_id: str
) -> tuple[str, list[str]]:
    """Build the caller's graph, run it against their thread, extract the reply."""
    graph = build_graph(bearer_token, company_id)
    result = await graph.ainvoke(
        {"messages": [HumanMessage(content=message)]},
        config={"configurable": {"thread_id": thread_id}, "recursion_limit": _RECURSION_LIMIT},
    )
    messages = result["messages"] if isinstance(result, dict) else []
    return extract_reply(messages if isinstance(messages, list) else [])
