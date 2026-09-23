# Syntra AI service

FastAPI service for the LangChain/LangGraph chatbot: `GET /health` plus
`POST /api/v1/chat` (LangGraph ReAct agent with ERP tools + thread memory).

> Pure Python (`uv`) project — intentionally **no `package.json`**, so `pnpm`/`turbo`
> ignore it. Conventions live in `apps/ai/AGENTS.md`.

## Prerequisites

- Python 3.12, [`uv`](https://docs.astral.sh/uv/) installed.

## Quickstart

```bash
cd apps/ai
cp .env.example .env   # optional; defaults work without it
uv sync                # one-time: create .venv + install deps
uv run uvicorn ai.main:app --port 3003 --reload
curl -s localhost:3003/health
```

## Commands (run inside `apps/ai`)

| Task        | Command                                           |
| ----------- | ------------------------------------------------- |
| dev         | `uv run uvicorn ai.main:app --port 3003 --reload` |
| test        | `uv run pytest`                                   |
| lint        | `uv run ruff check .`                             |
| format      | `uv run ruff format .`                            |
| check-types | `uv run mypy src`                                 |

## Layout

```text
src/ai/
  main.py            # create_app() + lifespan + middleware order
  core/              # config (fail-fast settings), logging, errors, envelope
  middlewares/       # request-id (+ structlog correlation), access log
  api/router.py      # mounts public /health BEFORE /api
  api/v1/router.py   # mounts versioned routers (/v1 exactly once)
  modules/health/    # router (thin) + service (plain fns) + schemas + tests
  modules/chat/      # chat router + service + auth + graph + schemas + tests
  modules/chat/tools/ # read-only ERP tools (sales, stock, overdue, cash)
```

## Conventions (Python idioms, not ported TypeScript)

- **Logging**: `log = structlog.get_logger(__name__)` per module; `configure_logging()`
  runs once in `create_app`. `request_id` is auto-attached via contextvars.
- **DI**: module-level `router` objects; plain service functions. Reach for FastAPI
  `Depends()` only when something genuinely needs per-request construction.
- **Responses**: success goes through `response_model=SuccessEnvelope[T]` (OpenAPI stays
  truthful); the wire shape matches the Node V1 envelope so the frontend proxy
  unwraps uniformly. Errors: raise `AppError`, handlers format the envelope.
- **No timeout middleware**: `asyncio.wait_for` around ASGI `call_next` can't cancel
  reliably. Enforce timeouts at uvicorn/gateway level instead.
