# Syntra ERP

[![CI](https://github.com/hamzathul/Syntra/actions/workflows/ci.yml/badge.svg)](https://github.com/hamzathul/Syntra/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Node >= 20.9](https://img.shields.io/badge/node-%3E%3D20.9-339933?logo=node.js&logoColor=white)](package.json)
[![pnpm 11](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white)](package.json)
[![GitHub stars](https://img.shields.io/github/stars/hamzathul/Syntra?style=flat-square)](https://github.com/hamzathul/Syntra/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/hamzathul/Syntra?style=flat-square)](https://github.com/hamzathul/Syntra/forks)
[![GitHub issues](https://img.shields.io/github/issues/hamzathul/Syntra?style=flat-square)](https://github.com/hamzathul/Syntra/issues)
[![GitHub pull-requests](https://img.shields.io/github/issues-pr/hamzathul/Syntra?style=flat-square)](https://github.com/hamzathul/Syntra/pulls)

A microservice-based ERP system with Next.js frontend, Core (Auth) API, ERP API, and AI chatbot API.

[View Demo](#quick-start) · [Report Bug](https://github.com/hamzathul/Syntra/issues/new?template=bug_report.yml) · [Request Feature](https://github.com/hamzathul/Syntra/issues/new?template=feature_request.yml)

## Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Workspaces](#workspaces)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Key Design Decisions](#key-design-decisions)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [Support](#support)
- [Security](#security)
- [License](#license)

## Architecture

- **Frontend** — Next.js 16 (port 3000) with shadcn/ui, TanStack Query, Tailwind v4
- **Core API** — Express service (port 3001) handling auth, JWT, user management
- **ERP API** — Express service (port 3002) handling companies, items, sales, purchases
- **AI API** — FastAPI service (port 3003) with LangGraph agent answering questions over live ERP data

> **`packages/backend` (`backend-p`) is a built npm workspace package** — run `pnpm --filter backend-p build` before type-checking/building apps that import it (e.g. `pnpm --filter erp check-types`).

## Prerequisites

- Node.js >= 20.9, pnpm 11.1.1
- Docker + Docker Compose (PostgreSQL 16)
- Python 3.12 + [`uv`](https://docs.astral.sh/uv/) (for `apps/ai` only)
- An OpenRouter key (`LLM_API_KEY`) for the AI service

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

## Project Structure

```text
apps/
  frontend/     # Next.js 16 app (port 3000)
  backend/      # Core Auth & User API (port 3001)
  erp/          # ERP business API (port 3002)
  ai/           # FastAPI + LangGraph chatbot (port 3003)
packages/
  backend/      # Reusable Express abstractions (backend-p)
  shared/       # Zod contracts + TypeScript DTOs
.github/
  workflows/ci.yml
  ISSUE_TEMPLATE/  # bug / feature / question / docs
scripts/        # DB init + helpers
```

## Scripts

| Command                         | Purpose                                                                 |
| ------------------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`                      | All JS apps in watch mode                                               |
| `pnpm build`                    | Build all packages and apps                                             |
| `pnpm lint`                     | ESLint, zero-warnings policy                                            |
| `pnpm check-types`              | Strict TypeScript check                                                 |
| `pnpm test`                     | All workspace tests (turbo)                                             |
| `pnpm db:up` / `pnpm db:down`   | Start / stop PostgreSQL                                                 |
| `pnpm --filter <pkg> <cmd>`     | Target one workspace (`core`, `erp`, `frontend`, `backend-p`, `shared`) |
| `pnpm --filter backend-p build` | Required before type-checking apps that import it                       |

AI service (`apps/ai`, separate): `uv sync`, `uv run ruff check .`,
`uv run ruff format --check .`, `uv run mypy src`, `uv run pytest`.

## Key Design Decisions

- **BFF pattern**: Frontend proxies all API calls through Next.js route handlers — JWT never reaches the browser
- **Ports & Adapters**: Services depend on interfaces, not concrete implementations — wired via factories
- **No JWT in ERP**: ERP validates identity by calling Core's `/auth/me` endpoint
- **Shared contracts**: Zod schemas in `packages/shared` are the single source of truth for API shapes
- **Frontend factories**: Services use `crud-factory.ts` (`.list()/.create()/.update()/.remove()`), hooks use `hook-factory.ts` — no hand-written axios wrappers or raw `useQuery`
- **DTO mappers**: Each entity has a `*.mapper.ts` with pure `toXDto()` functions — no inline mapping in services/repositories
- **Shared Express infra** in `backend-p`: `loadEnv` (env config), `createHealthRouter` (`GET /health`), `createRequestTimeoutMiddleware` (408), `getCompanyId`/`getParamId` helpers

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Open PRs against `dev`, follow `AGENTS.md`
conventions, and ensure `pnpm build && pnpm lint && pnpm check-types && pnpm test` passes.
Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Roadmap

Tentative direction (see [issues](https://github.com/hamzathul/Syntra/issues) for details):

- [ ] Harden auth: refresh rotation, rate limiting, audit logs
- [ ] ERP modules: inventory, invoicing, reporting
- [ ] AI chatbot: deeper ERP tool coverage, evals
- [ ] Docs + e2e test coverage

Have an idea? Open a [feature request](https://github.com/hamzathul/Syntra/issues/new?template=feature_request.yml).

## Contributors

Thanks to everyone who contributes.

<a href="https://github.com/hamzathul/Syntra/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=hamzathul/Syntra" alt="Contributors" />
</a>

Want to be listed? See [CONTRIBUTING.md](CONTRIBUTING.md).

## Support

We all need support and motivation. If Syntra ERP helps you, please give it a ⭐
before you move on — it keeps the project going.

Questions? Start with [SUPPORT.md](SUPPORT.md) or open a
[question issue](https://github.com/hamzathul/Syntra/issues/new?template=question.yml).

## Security

Do not open public issues for vulnerabilities — see [SECURITY.md](SECURITY.md).

## License

Licensed under the [Apache License 2.0](LICENSE).
Copyright 2026 Hamzathul Favas E. See [LICENSE](LICENSE) for details.
