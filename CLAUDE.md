# CLAUDE.md

This file provides guidance for OpenCode/Claude Code agents working in this repository.

## Commands

All commands run from the repo root via pnpm.

### General
- `pnpm dev` — Start all apps in watch mode.
- `pnpm build` — Build all packages and apps.
- `pnpm lint` — ESLint across all workspaces (zero warnings policy).
- `pnpm check-types` — TypeScript strict check across all workspaces.
- `pnpm format` — Prettier on `**/*.{ts,tsx,md}`.

### Workspace-Specific
Use `--filter <package-name>`:
- `pnpm --filter core dev` — Core (Auth) API on port 3001 (`apps/backend`).
- `pnpm --filter erp dev` — ERP API on port 3002.
- `pnpm --filter frontend dev` — Next.js frontend on port 3000.
- `pnpm --filter backend-p build` — Build `packages/backend`.

### Prisma (for `apps/backend`, package name `core`)
- `pnpm --filter core db:migrate` — Create and apply new migration (development).
- `pnpm --filter core db:migrate:prod` — Apply pending migrations (CI/production).
- `pnpm --filter core db:reset` — Drop DB, re-run all migrations, and seed (dev only).
- `pnpm --filter core db:generate` — Regenerate Prisma Client after schema change.
- `pnpm --filter core db:studio` — Open Prisma Studio GUI.
- `pnpm --filter core db:seed` — Run `prisma/seed.ts`.
- `pnpm --filter core db:status` — Show applied migrations.

## Monorepo Layout

apps/
  backend/       — "core" package — Auth & User service (port 3001)
  erp/           — "erp" package — ERP service (port 3002)
  frontend/      — Next.js 16 application (port 3000)
packages/
  backend/       — "backend-p" — reusable Express abstractions
  shared/        — Zod schemas + TypeScript types shared between apps
  eslint-config/ — "@repo/eslint-config"
  typescript-config/ — "@repo/typescript-config"

> Note: The directory is `apps/backend` but the package name is `"core"`. Use `--filter core` in pnpm commands.

## Microservice Architecture

Browser (Frontend) → Core API (port 3001) for auth → ERP API (port 3002) for ERP data.
ERP validates identity by calling Core API `GET /api/v1/auth/me`, passing the incoming Bearer token. ERP never holds the JWT secret.

Frontend uses Next.js API routes as a BFF layer — httpOnly cookies are converted to Bearer tokens for backend services. Proxy routes (`/api/proxy/core/*`, `/api/proxy/erp/*`) handle automatic token refresh on 401.

## Request Lifecycle (apps/backend and apps/erp)

Express app → requestId → requestLog → sanitize → routes → globalError

Per-route: validateRequest(Zod schema) → [authenticate] → Controller → Service → Repository

## Frontend Structure (apps/frontend)

app/
  (auth)/         — Route group — login, register (no sidebar)
  (main)/         — Route group — protected, with sidebar + header
    layout.tsx    — Sidebar + header with UserNav (profile, dark mode toggle)
    dashboard/
    sales/        — Stub page ("coming soon")
    purchases/    — Stub page ("coming soon")
    items/        — Stub page ("coming soon")
    reports/      — Stub page ("coming soon")
    settings/     — Stub page ("coming soon")
  onboarding/
  api/auth/*      — Login, register, logout, refresh route handlers (BFF)
  api/proxy/*     — Proxy routes with auto token refresh
  layout.tsx      — Root layout: ThemeProvider, QueryClient, Toaster
  globals.css     — Tailwind v4 + shadcn CSS variables (light + dark)
proxy.ts          — Next.js 16 middleware file (not middleware.ts). Route protection — redirects unauthenticated → /login.

Dark/light mode: next-themes with `attribute="class"` and `defaultTheme="system"`. Toggle is in the user dropdown nav.

## Dependency Injection

Interfaces in `*.port.ts` files. Concrete classes wired in `factories/*.factory.ts` inside `apps/backend` and `apps/erp`. Constructor injection only — the factory is the only place concrete classes are instantiated.

## Error Handling

Throw an `AppError` subclass — global error middleware catches and formats via `ResponseFactory`. HTTP error classes in `packages/backend/src/errors/http-errors.ts`: `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `ConflictError`, `NotFoundError`, `InternalServerError`.

## API Response Shape

All responses use `V1ResponseFactory` (singleton). Shapes defined in `packages/shared/src/api/response.ts`. Success: `{ status, message, data, meta }`. Error: `{ status, message, error, meta, debug? }`.

## Auth

- `packages/backend/src/auth/token-signer.port.ts` — `TokenSigner` interface.
- `packages/backend/src/auth/token-verifier.port.ts` — `TokenVerifier` interface.
- JWT via **jose** (dynamic import — ESM-only package); roles: `USER | ADMIN`.

## Contracts (shared package)

Zod schemas in `packages/shared/src/contracts/` are the single source of truth.
- `auth.contract.ts` — register, login, me, token, session shapes.
- `company.contract.ts` — company CRUD shapes.

## Key Conventions

- **Ports** (`*.port.ts`) define interfaces; never import a concrete class where a port suffices.
- **Factories** (`*.factory.ts`) are the only place where concrete classes are instantiated.
- Validation at middleware layer via `validateRequest(schema)`. Services trust their inputs.
- Logging via `LoggerPort` only — never `pino` or `console` directly.
- shadcn components live in `apps/frontend/components/ui/`. Use `cn()` from `@/lib/utils`.
- React Query hooks in `apps/frontend/hooks/` with query key factory pattern.
- Frontend API types import from `shared` — never redefine locally.
