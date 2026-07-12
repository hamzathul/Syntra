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
- `pnpm test`: Run all workspace tests via turbo.

### Workspace-Specific Commands
To target a single workspace, use `--filter <package-name>`:
- `pnpm --filter core dev`: Core (auth) API on port 3001 (`apps/backend` is package `core`).
- `pnpm --filter erp dev`: ERP API on port 3002.
- `pnpm --filter frontend dev`: Next.js frontend on port 3000.
- `pnpm --filter backend-p build`: Build `packages/backend`.
- `pnpm --filter shared test`: Run shared package tests.
- `pnpm --filter backend-p test`: Run backend-p package tests.

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
- **`packages/shared`** holds Zod schemas and TypeScript types.

## 3. Microservice Architecture
- **Browser (Frontend)**: Calls Core API (port 3001) for auth, and ERP API (port 3002) for ERP data.
- **ERP API**: Validates identity by calling Core API `GET /api/v1/auth/me`, passing the incoming Bearer token. ERP never holds the JWT secret.
- **JWT**: Issued by Core, stored in browser cookie (`access_token`), sent as `Authorization: Bearer <token>`.

## 4. Design Patterns & Conventions

### Ports & Adapters (Hexagonal Architecture)
- Define interfaces in dedicated `*.port.ts` files — one interface per file.
- Never co-locate a port interface with its implementation class.
- Keep ports in the same directory as their consumers (e.g. `auth.service.port.ts` next to `auth.service.ts`).
- Implementations and ports should be separate files: `auth.service.port.ts` + `auth.service.ts`.

### Factory Pattern
- **`*.factory.ts` files are the ONLY place `new ClassName()` is called** for application classes.
- Cross-cutting infrastructure (PrismaClient, Pino logger, etc.) is created at the app level and wired into factories.
- Factories use lazy singleton initialization — `getInstance()` / `createController()` pattern.

### Dependency Injection
- **Constructor injection only** — services receive all dependencies via constructor parameters.
- Never import a concrete dependency directly in a service (e.g. no `import logger from "../../utils/logger"` in a service).
- The factory is responsible for creating and wiring all concrete instances.

### Layer Separation
- **Controllers**: Handle HTTP concerns only — parse request, call service, format response. No business logic, no validation.
- **Services**: Business logic only — no HTTP concepts (no `req`, `res`, `next`). Trust their inputs (validation happened in middleware).
- **Repositories**: Data access only — Prisma queries behind interfaces. No business logic.
- **Routes/Middleware**: Validation (`validateRequest(schema)`), authentication, authorization, company context.

### Error Handling
- Always throw `AppError` subclasses (`NotFoundError`, `ConflictError`, `UnauthorizedError`, etc.).
- Use `new ClassName()` for errors — the factory helper functions (`createBadRequestError`, etc.) exist but are not enforced.
- Never catch errors in controllers — `BaseController.asyncHandler` passes them to the global error middleware.

### Logging
- Always use `LoggerPort` interface injected via constructor.
- Never import `pino` or `console` directly in services.
- Use structured audit logs with `{ category: "audit", action: "resource.action", ... }` payload.

### Frontend API Types
- **Always import types from `shared`** — never redefine `AuthUserDto`, `AuthTokenDto`, `ApiSuccessResponse`, `ApiErrorResponse` locally.
- React Query hooks go in `apps/frontend/hooks/` with query key factory pattern.

## 5. Test Conventions
- Tests use **Vitest** and are co-located with source files as `*.test.ts`.
- Test files are excluded from production builds via `**/*.test.ts` in tsconfig `exclude`.
- Write tests for:
  - Schema validation (contracts in `shared`)
  - Error classes and utilities (in `backend-p`)
  - Service logic (in `apps/backend` and `apps/erp`)
- Run with: `pnpm --filter <package> test` or `pnpm test` for all workspaces.

## 6. Key Reminders
- **Ports vs. Concrete Classes**: Always import interfaces (`*.port.ts`). Avoid concrete class imports where a port suffices.
- **Factories**: `*.factory.ts` files are the *only* place where concrete classes are instantiated.
- **Dependency Injection**: Use constructor injection. Interfaces (`*.port.ts`) define contracts. Concrete implementations are wired in `factories/*.factory.ts`.
- **Validation**: Occurs at the middleware layer via `validateRequest(schema)`. Services *trust their inputs*.
- **Error Handling**: Throw `AppError` subclasses. Global error middleware (`ResponseFactory`) formats responses.
- **API Response Shape**: All responses use `V1ResponseFactory` (singleton). Shapes in `packages/shared/src/api/response.ts`.
- **Logging**: Use `LoggerPort` only. Never use `pino` or `console` directly.
- **Contracts**: Zod schemas in `packages/shared/src/contracts/` are the single source of truth.
- **Frontend UI**: `shadcn` components in `apps/frontend/components/ui/`. Use `cn()` from `@/lib/utils`.
- **Dark/Light Mode**: Uses `next-themes` with `attribute="class"`, `defaultTheme="system"`. The `.dark` class is applied to `<html>`.
