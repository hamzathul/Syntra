# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root via Turbo unless targeting a specific workspace.

```bash
pnpm dev              # start all apps in watch mode
pnpm build            # build all packages and apps
pnpm lint             # ESLint across all workspaces (zero warnings policy)
pnpm check-types      # TypeScript strict check across all workspaces
pnpm format           # Prettier on **/*.{ts,tsx,md}
```

To target a single workspace:
```bash
pnpm --filter core dev          # Core (auth) API on port 3001
pnpm --filter erp dev           # ERP API on port 3002
pnpm --filter frontend dev      # Next.js frontend on port 3000
pnpm --filter backend-p build
```

Prisma (run from `apps/backend`):
```bash
pnpm --filter core prisma migrate dev
pnpm --filter core prisma generate
```

## Monorepo Layout

```
apps/
  backend/      # "core" package — Auth & User service (port 3001)
  erp/          # ERP service — calls core for identity (port 3002)
  frontend/     # Next.js 16 application (port 3000)
packages/
  backend/      # "backend-p" — reusable Express abstractions (published internally)
  frontend/     # "frontend-p" — Axios HTTP client patterns
  shared/       # Contracts (Zod schemas + TypeScript types) shared between apps
  ui/           # React component library stub
  eslint-config/
  typescript-config/
```

> **Note**: The directory is `apps/backend` but the package name is `"core"`. Use `--filter core` in pnpm commands.

## Microservice Architecture

```
Browser (apps/frontend)
  ├── Auth calls → Core API (apps/backend, port 3001)
  │     POST /api/v1/auth/register
  │     POST /api/v1/auth/login
  │     GET  /api/v1/auth/me
  └── ERP calls → ERP API (apps/erp, port 3002)
        GET  /api/v1/items
        GET  /api/v1/sales
        GET  /api/v1/purchases
        GET  /api/v1/settings

ERP API (apps/erp)
  └── Validates identity → Core API GET /api/v1/auth/me
        (passes Bearer token from incoming request)
```

JWT is issued by Core, stored in a browser cookie (`access_token`), and sent as `Authorization: Bearer <token>` to both Core and ERP APIs. ERP validates identity by calling Core's `/me` endpoint — it never holds the JWT secret.

## Request lifecycle (apps/backend and apps/erp)

```
Express app (src/index.ts)
  → requestId middleware
  → requestLog middleware
  → sanitize middleware
  → route handler
      → validateRequest middleware (Zod schema)
      → authenticate middleware  (optional)
      → Controller (extends BaseController)
          → Service (extends BaseService)
              → Repository (extends BaseRepository)
  → globalError middleware
```

## Frontend structure (apps/frontend)

```
app/
  (auth)/         # Route group — login, register (no sidebar)
  (dashboard)/    # Route group — protected by middleware
    layout.tsx    # Sidebar + header with theme toggle + user nav
    page.tsx      # Overview
    sales/
    purchases/
    items/
    reports/
    settings/
  layout.tsx      # Root layout — ThemeProvider, QueryClient, Toaster
  globals.css     # Tailwind v4 + shadcn CSS variables (light + dark)
components/
  ui/             # shadcn components (button, card, input, label, etc.)
  layout/         # Sidebar, ThemeToggle, UserNav
  auth/           # LoginForm, RegisterForm
lib/
  auth.ts         # Cookie helpers — getToken, setSession, clearSession
  utils.ts        # cn() utility
  api/
    core-client.ts   # Axios client for Core API
    erp-client.ts    # Axios client for ERP API
middleware.ts     # Route protection — redirects unauthenticated → /login
```

**Dark/light mode**: `next-themes` with `attribute="class"` and `defaultTheme="system"`. The `.dark` class is applied to `<html>` and all CSS variables re-map under `.dark {}`.

## Dependency injection

All major dependencies flow through constructor injection. Interface contracts live in `*.port.ts` files. Concrete implementations are wired in `factories/*.factory.ts` inside `apps/backend`.

## Error handling

Throw an `AppError` subclass — the global error middleware catches it and formats via `ResponseFactory`. HTTP error classes live in `packages/backend/src/errors/http-errors.ts`: `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `ConflictError`, `NotFoundError`, `InternalServerError`.

## API response shape

All responses go through `V1ResponseFactory` (singleton). Shapes are defined in `packages/shared/src/api/response.ts`: `ApiSuccessResponse<TData>` / `ApiErrorResponse`.

## Auth

- `packages/backend/src/auth/token-verifier.port.ts` — `TokenVerifier` interface.
- `packages/backend/src/auth/token-signer.port.ts` — `TokenSigner` interface.
- `packages/backend/src/middlewares/authentication.middleware.ts` — `createAuthMiddleware(verifier)`.
- `packages/backend/src/middlewares/authorization.middleware.ts` — role-based guard.
- JWT via **jose** (dynamic import — ESM-only package); roles: `USER | ADMIN`.

## Contracts (shared package)

Zod schemas in `packages/shared/src/contracts/` are the single source of truth.
- `auth.contract.ts` — register, login, me shapes
- `erp.contract.ts` — item, sale, purchase DTOs
- `health.contract.ts` — health check

## Patterns in backend-p

| Pattern | Location | Purpose |
|---|---|---|
| Adapter | `patterns/adapter/pino-logger.adapter.ts` | Wraps Pino behind `LoggerPort` |
| Decorator | `patterns/decorator/with-error-logging.decorator.ts` | Logging around service methods |
| Observer | `patterns/observer/domain-event-bus.ts` | In-process domain events |
| Strategy | `patterns/strategy/cursor-pagination.strategy.ts` | Pluggable cursor pagination |
| Factory | `patterns/factory/response.factory.ts` | Singleton response builder |

## Key conventions

- **Ports** (`*.port.ts`) define interfaces; never import a concrete class where a port suffices.
- **Factories** (`*.factory.ts`) are the only place where concrete classes are instantiated.
- Validation at middleware layer only — `validateRequest(schema)`. Services trust their inputs.
- Cursor pagination for list endpoints — `CursorPaginationStrategy`.
- Logging via `LoggerPort` only — never `pino` or `console` directly.
- shadcn components live in `apps/frontend/components/ui/`. Use `cn()` from `@/lib/utils`.
