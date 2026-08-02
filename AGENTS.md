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

> **`packages/backend` (`backend-p`) is a built npm workspace package** — run `pnpm --filter backend-p build` before type-checking/building apps that import it (e.g. `pnpm --filter erp check-types`).

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
- **Mappers** (`*.mapper.ts`): Pure functions that convert internal record types → shared DTOs (`toTaxRateDto`, `toCompanyDto`, etc.). No classes, no I/O, no `this`. Every entity's `record → DTO` mapping lives in exactly one mapper file — never inline in a service or repository.
- **Routes/Middleware**: Validation (`validateRequest(schema)`), authentication, authorization, company context.

### Logging

- Always use `LoggerPort` interface injected via constructor.
- Never import `pino` or `console` directly in services.
- Use structured audit logs with `{ category: "audit", action: "resource.action", ... }` payload.

### Frontend API Clients

- Axios instances in `apps/frontend/lib/api/client/`: `core-client.ts` (`coreApi`, baseURL `/api/proxy/core`) and `erp-client.ts` (`erpApi`, baseURL `/api/proxy/erp`).
- **Both clients unwrap the envelope**: a response interceptor replaces `response.data` with `response.data.data` when the payload has a `data` key. Consumers work with the DTO directly — never `res.data.data`.
- `erpApi` adds the active company header: a request interceptor sets `X-Company-Id` from `getActiveCompany()`.
- `core-client.ts` exports `getApiErrorMessage(error)` for surfacing server errors in the UI.

### Frontend Service Factory

- Service files live in `apps/frontend/lib/api/services/` (e.g. `settings/taxes.service.ts`, `company.service.ts`).
- **Do not hand-write `get/post/patch/delete` wrappers.** Use the factories in `apps/frontend/lib/api/client/crud-factory.ts`:
  - `createGetUpdate<TGet, TUpdate>(api, path)` → `.get()` / `.update(dto)` (single resource, e.g. settings).
  - `createListCreate<T>(api, path)` → `.list()` / `.create(dto)` (collection).
  - `createCrud<T>(api, path)` → `.list()` / `.create(dto)` / `.update(id, dto)` / `.remove(id)`.
  - Nested resources use sub-objects: `taxesService.rates = createCrud(...)`, `taxesService.groups = createCrud(...)`.

### Frontend Hook Factory

- React Query hooks live in `apps/frontend/hooks/` (settings hooks in `hooks/settings/`), built with `apps/frontend/lib/api/client/hook-factory.ts`:
  - `createGetQueryHook(keyFactory, queryFn, staleTime = 60_000)` → `useX()`.
  - `createMutationHook(keyFactory, mutationFn)` → invalidates the query on success.
  - `createUpdateMutationHook(keyFactory, (id, dto) => ...)` → takes `{ id, dto }` variables.
- Query keys use the key factory pattern in `apps/frontend/hooks/query-keys.ts` (`authKeys`, `companyKeys`, `settingsKeys`, `taxKeys`). Key factories return `readonly unknown[]` tuples.
- `useAuthUser` (in `hooks/use-auth-query.ts`) is not factory-built — it needs `retry: false`, `placeholderData`, and post-login cache seeding.

### Frontend Page State & Error Boundaries

- Loading/error/empty handling for async pages uses `PageState<T>` from `apps/frontend/components/ui/page-state.tsx` — a generic render-prop component (`children: (data: T) => React.ReactNode`). Do not duplicate inline `isLoading`/`error` blocks.
- Error/loading boundaries: `app/error.tsx`, `app/(auth)/error.tsx` + `loading.tsx`, `app/onboarding/error.tsx` + `loading.tsx` — all reuse `PageError` from `components/ui/error-boundary.tsx`.

### Shared Express Infrastructure (in `backend-p`)

- **Env config**: `packages/backend/src/config/env-factory.ts` exports `loadEnv(portDefault, extras?)` and `BaseEnv`. Every app's `config/env.ts` calls it and adds app-specific keys via `extras`. `BaseEnv` must stay exported (avoid TS4023).
- **Request timeout**: `createRequestTimeoutMiddleware(timeoutMs)` in `packages/backend/src/middlewares/request-timeout.middleware.ts` — mounted after `requestIdMiddleware`, sends `408 REQUEST_TIMEOUT` and destroys the socket if headers already sent.
- **Health check**: `createHealthRouter({ checkDatabase })` in `packages/backend/src/middlewares/health.router.ts` — `GET /health`, `200 { status: "ok" }` or `503 HEALTH_CHECK_FAILED`. Mounted before `/api` (unauthenticated).
- **Request helpers**: `getCompanyId(locals)` in `packages/backend/src/auth/company-context.ts` and `getParamId(request, name)` in `packages/backend/src/utils/param-id.ts` — both throw `BadRequestError`. Use these instead of duplicating null-check/throw logic in controllers.

### Error Handling

- Always throw `AppError` subclasses (`NotFoundError`, `ConflictError`, `UnauthorizedError`, etc.).
- Use `new ClassName()` for errors — the factory helper functions (`createBadRequestError`, etc.) exist but are not enforced.
- Never catch errors in controllers — `BaseController.asyncHandler` passes them to the global error middleware.
- `createGlobalErrorHandler` is the **single** error-logging point. Do not add per-service error wrappers/decorators.
- **No `ResponseFactory`**: use `V1Response.getInstance()` directly (`v1.success(response, {...})` / `v1.error(response, {...})`).

### Next.js 16 Middleware

- This project uses Next.js 16 where the middleware file is named **`proxy.ts`** (at the repo root `apps/frontend/proxy.ts`), **not** `middleware.ts`.
- Never suggest renaming `proxy.ts` to `middleware.ts` — that is the old Next.js convention and does not apply here.

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
- **Factories**: `*.factory.ts` files are the _only_ place where concrete classes are instantiated.
- **Dependency Injection**: Use constructor injection. Interfaces (`*.port.ts`) define contracts. Concrete implementations are wired in `factories/*.factory.ts`.
- **Validation**: Occurs at the middleware layer via `validateRequest(schema)`. Services _trust their inputs_.
- **Error Handling**: Throw `AppError` subclasses. Global error middleware (`createGlobalErrorHandler`) is the single error-logging point and formats responses.
- **API Response Shape**: All responses use `V1Response.getInstance()` directly — there is **no `ResponseFactory`**. Shapes in `packages/shared/src/api/response.ts`.
- **Mappers**: `record → DTO` conversion lives in `*.mapper.ts` pure functions. Never inline `toDto` in services.
- **Logging**: Use `LoggerPort` only. Never use `pino` or `console` directly.
- **Contracts**: Zod schemas in `packages/shared/src/contracts/` are the single source of truth.
- **Frontend UI**: `shadcn` components in `apps/frontend/components/ui/`. Use `cn()` from `@/lib/utils`.
- **Frontend services/hooks**: Use `crud-factory.ts` + `hook-factory.ts` — never hand-write axios wrappers or raw `useQuery`/`useMutation`.
- **Dark/Light Mode**: Uses `next-themes` with `attribute="class"`, `defaultTheme="system"`. The `.dark` class is applied to `<html>`.
