# AGENTS.md — `apps/ai` (Python/FastAPI)

Companion to the root `AGENTS.md`. Same product shapes, Python idioms —
do NOT port TypeScript patterns (ports/adapters, singleton factories) here.

## 1. Commands (run inside `apps/ai` via `uv`)

- `uv run uvicorn ai.main:app --port 3003 --reload` — dev server.
- `uv run pytest` — tests (co-located `test_*.py`, `pythonpath=["src"]`).
- `uv run ruff check .` / `uv run ruff format .` — lint/format (zero warnings).
- `uv run mypy src` — strict type-check, must pass.

No `package.json` here on purpose — `pnpm`/`turbo` ignore this dir.

## 2. Layout

- `main.py` — `create_app()` + lifespan; flow is CORS → request-id → access log,
  health mounted before `/api`, `/v1` mounted exactly once in `api/`.
- `core/` — `config.py` (pydantic-settings, fail-fast), `logging.py`
  (`configure_logging()` only), `errors.py` (`AppError` + handlers = single
  logging point), `envelope.py` (V1 `SuccessEnvelope[T]`/`ErrorEnvelope` models).
- `middlewares/` — one middleware per file, no constructor deps.
- `modules/<domain>/` — `router.py` (module-level `router`, thin),
  `service.py` (plain functions, no `Request`), `schemas.py` (Pydantic edge models).

## 3. Rules

- **Logging**: `structlog.get_logger(__name__)` directly in any module. Never `print`.
- **No factories/singletons**: module-level routers + functions; `Depends()` only
  when per-request construction is actually needed.
- **Layering**: routers = HTTP only; services = no `Request`/`Response`;
  Pydantic validates at the edge, services trust inputs.
- **Errors**: raise `AppError` subclasses; never `try/except`-and-log in routers —
  handlers in `core/errors.py` log once and format the envelope.
- **Envelope**: success via `response_model=SuccessEnvelope[T]` **plus**
  `response_model_exclude_none=True` (matches the error path, which omits absent
  fields — never serialize `requestId: null`); wire shape matches
  `shared/api/response.ts` (`status/message/data/meta`). `GET /health` is public.
- **No timeout middleware**: unenforceable reliably in ASGI — timeouts live at
  uvicorn/gateway level.
- **Naming**: `snake_case` modules, `CapWords` models/errors, type-annotate
  everything (mypy strict).
