# AGENTS.md

This file provides critical guidance for OpenCode agents working in this repository. Focus on these points to ramp up quickly and avoid common mistakes.

## 1. Commands

All commands run from the repo root via `pnpm`.

### General
- `pnpm dev`: Start all apps in watch mode.
- `pnpm build`: Build all packages and apps.
- `pnpm lint`: Run ESLint across all workspaces (zero warnings policy).
- `pnpm check-types`: Run TypeScript strict check across all workspaces.
- `pnpm format`: Run Prettier on `**/*.{ts,tsx,md}`.

### Workspace-Specific Commands
To target a single workspace, use `--filter <package-name>`:
- `pnpm --filter core dev`: Core (auth) API on port 3001 (`apps/backend` is package `core`).
- `pnpm --filter erp dev`: ERP API on port 3002.
- `pnpm --filter frontend dev`: Next.js frontend on port 3000.
- `pnpm --filter backend-p build`: Build `packages/backend`.

### Prisma Commands (for `apps/backend`, package name `core`)
- `pnpm --filter core db:migrate`: Create and apply new migration (development).
- `pnpm --filter core db:migrate:prod`: Apply pending migrations (CI/production).
- `pnpm --filter core db:reset`: Drop DB, re-run all migrations, and seed (development only).
- `pnpm --filter core db:generate`: Regenerate Prisma Client after schema change.
- `pnpm --filter core db:studio`: Open Prisma Studio GUI.
- `pnpm --filter core db:seed`: Run `prisma/seed.ts`.
- `pnpm --filter core db:status`: Show applied migrations.

## 2. Monorepo Layout & Package Names
- **`apps/backend`** is the **`core`** package (Auth & User service).
- **`apps/erp`** is the **`erp`** package (ERP service).
- **`apps/frontend`** is the **`frontend`** package (Next.js application).
- **`packages/backend`** is the **`backend-p`** package (reusable Express abstractions).
- **`packages/frontend`** is the **`frontend-p`** package (Axios HTTP client patterns).
- **`packages/shared`** holds Zod schemas and TypeScript types.

## 3. Microservice Architecture
- **Browser (Frontend)**: Calls Core API (port 3001) for auth, and ERP API (port 3002) for ERP data.
- **ERP API**: Validates identity by calling Core API `GET /api/v1/auth/me`, passing the incoming Bearer token. ERP never holds the JWT secret.
- **JWT**: Issued by Core, stored in browser cookie (`access_token`), sent as `Authorization: Bearer <token>`.

## 4. Key Conventions
- **Ports vs. Concrete Classes**: Always import interfaces (`*.port.ts`). Avoid concrete class imports where a port suffices.
- **Factories**: `*.factory.ts` files are the *only* place where concrete classes are instantiated.
- **Dependency Injection**: Use constructor injection. Interfaces (`*.port.ts`) define contracts. Concrete implementations are wired in `factories/*.factory.ts` (in `apps/backend`).
- **Validation**: Occurs at the middleware layer via `validateRequest(schema)`. Services *trust their inputs*.
- **Error Handling**: Throw `AppError` subclasses. Global error middleware (`ResponseFactory`) formats responses. HTTP error classes: `packages/backend/src/errors/http-errors.ts`.
- **API Response Shape**: All responses use `V1ResponseFactory` (singleton). Shapes in `packages/shared/src/api/response.ts`.
- **Logging**: Use `LoggerPort` only. Never use `pino` or `console` directly.
- **Contracts**: Zod schemas in `packages/shared/src/contracts/` are the single source of truth.
- **Frontend UI**: `shadcn` components in `apps/frontend/components/ui/`. Use `cn()` from `@/lib/utils`.
- **Dark/Light Mode**: Uses `next-themes` with `attribute="class"`, `defaultTheme="system"`. The `.dark` class is applied to `<html>`.
