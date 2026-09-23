# Syntra ERP

A microservice-based ERP system with Next.js frontend, Core (Auth) API, ERP API, and AI chatbot API.

## Architecture

- **Frontend** — Next.js 16 (port 3000) with shadcn/ui, TanStack Query, Tailwind v4
- **Core API** — Express service (port 3001) handling auth, JWT, user management
- **ERP API** — Express service (port 3002) handling companies, items, sales, purchases
- **AI API** — FastAPI service (port 3003) with LangGraph agent answering questions over live ERP data

> **`packages/backend` (`backend-p`) is a built npm workspace package** — run `pnpm --filter backend-p build` before type-checking/building apps that import it (e.g. `pnpm --filter erp check-types`).

## Quick Start

```bash
pnpm install
docker compose up -d            # Start PostgreSQL
pnpm --filter core db:migrate   # Apply migrations + seed
pnpm dev                        # Start frontend + Core + ERP (ports 3000/3001/3002)
```

In a separate terminal — start the AI service (pure Python, not managed by turbo):

```bash
cd apps/ai
cp .env.example .env  # then set LLM_API_KEY (OpenRouter key)
uv sync               # one-time: create .venv + install deps
uv run uvicorn ai.main:app --port 3003 --reload
```

> The frontend proxies to the AI service with a built-in `http://localhost:3003/api/v1` fallback. To override it, set `AI_API_URL` in `apps/frontend/.env.local`.

## Workspaces

| Package     | Location           | Purpose                                           |
| ----------- | ------------------ | ------------------------------------------------- |
| `core`      | `apps/backend`     | Auth & user service (Express + Prisma)            |
| `erp`       | `apps/erp`         | ERP business logic (Express + Prisma)             |
| `frontend`  | `apps/frontend`    | Next.js application (port 3000)                   |
| `syntra-ai` | `apps/ai`          | AI chatbot API (FastAPI + LangGraph, port 3003)\* |
| `backend-p` | `packages/backend` | Reusable Express abstractions                     |
| `shared`    | `packages/shared`  | Zod schemas + TypeScript types                    |

> \*`apps/ai` is a pure Python (`uv`) project with intentionally **no `package.json`** — `pnpm`/`turbo` ignore it, so start it separately (see Quick Start).

## Key Design Decisions

- **BFF pattern**: Frontend proxies all API calls through Next.js route handlers — JWT never reaches the browser
- **Ports & Adapters**: Services depend on interfaces, not concrete implementations — wired via factories
- **No JWT in ERP**: ERP validates identity by calling Core's `/auth/me` endpoint
- **Shared contracts**: Zod schemas in `packages/shared` are the single source of truth for API shapes
- **Frontend factories**: Services use `crud-factory.ts` (`.list()/.create()/.update()/.remove()`), hooks use `hook-factory.ts` — no hand-written axios wrappers or raw `useQuery`
- **DTO mappers**: Each entity has a `*.mapper.ts` with pure `toXDto()` functions — no inline mapping in services/repositories
- **Shared Express infra** in `backend-p`: `loadEnv` (env config), `createHealthRouter` (`GET /health`), `createRequestTimeoutMiddleware` (408), `getCompanyId`/`getParamId` helpers
