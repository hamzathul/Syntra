# Contributing to Syntra ERP

Thanks for your interest in contributing to Syntra ERP. All noncommercial contributions are welcome.

> **License note:** Syntra ERP is open source under the [Apache License 2.0](LICENSE).
> By contributing you agree your contributions will be licensed under the same terms.

Please also read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md).

🆕 New to open source? Follow [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
to jumpstart your journey 🚀.

## Fork and Clone

1. Fork this repo (top-right **Fork** button).
2. Clone your fork and set the upstream:

```bash
git clone https://github.com/<your-username>/Syntra.git
cd Syntra
git remote add upstream https://github.com/hamzathul/Syntra.git
```

3. Create your branch from `dev`:

```bash
git checkout dev
git pull upstream dev
git checkout -b feat/<short-name>
```

## Quick Start

Prerequisites: Node >= 20.9, pnpm 11.1.1, Docker, Python + `uv` (for `apps/ai` only).

```bash
pnpm install
docker compose up -d            # Start PostgreSQL
pnpm --filter core db:migrate   # Apply migrations + seed
pnpm dev                        # frontend + Core + ERP (ports 3000/3001/3002)
```

AI service (separate terminal, pure Python — not managed by turbo):

```bash
cd apps/ai
cp .env.example .env  # set LLM_API_KEY (OpenRouter key)
uv sync
uv run uvicorn ai.main:app --port 3003 --reload
```

## Branches

- `main` — stable releases only.
- `dev` — default integration branch. **Open all PRs against `dev`.**
- Feature branches: `feat/<short-name>`, fixes: `fix/<short-name>`, docs: `docs/<short-name>`.

CI (`CI` workflow) runs on PRs to `dev` and pushes to `dev`/`main`.

## Before You Push

```bash
pnpm build
pnpm lint
pnpm check-types
pnpm test
```

> `packages/backend` (`backend-p`) is a built workspace package — run
> `pnpm --filter backend-p build` before type-checking/building apps that import it.

Python (`apps/ai`):

```bash
uv run ruff check .
uv run ruff format --check .
uv run mypy src
uv run pytest
```

## Repo Conventions

Read [AGENTS.md](AGENTS.md) for the full rules. The essentials:

- **Ports & Adapters:** interfaces in `*.port.ts` (one per file), implementations separate.
- **Factories only:** `*.factory.ts` is the only place `new ClassName()` is called for app classes.
- **Constructor injection only.** No direct `pino`/`console` imports in services — inject `LoggerPort`.
- **Layer separation:** controllers = HTTP only, services = business logic, repositories = Prisma only, `*.mapper.ts` = pure `record → DTO` functions.
- **Validation** in middleware via `validateRequest(schema)` (Zod in `packages/shared`). Services trust inputs.
- **Errors:** throw `AppError` subclasses (`NotFoundError`, `ConflictError`, …). Never catch in controllers.
- **Responses:** `V1Response.getInstance()` directly. Create = `201`, DELETE = `200` with `data: null`. Routes mount `/v1` once.
- **Frontend:** use `crud-factory.ts` + `hook-factory.ts` — no hand-written axios wrappers or raw `useQuery`/`useMutation` (except `useAuthUser`). Use `PageState<T>` for loading/error/empty. No page-scoped context providers.
- **Tests:** Vitest, co-located `*.test.ts`. Run per-workspace: `pnpm --filter <package> test`.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(erp): add tax group validation
fix(core): return 409 on duplicate company
docs: clarify AI setup
```

## Pull Requests

1. Fork the repo and create your branch from `dev`.
2. Keep PRs small and focused — one feature/fix per PR.
3. Fill in `.github/PULL_REQUEST_TEMPLATE.md` (what, why, how tested).
4. Ensure CI is green. Add/adjust tests for behavior changes.
5. Request review. At least one approval is required before merge.
6. Never commit secrets (`.env`, tokens, keys). Check `git status`/`git diff` before pushing.

## Reporting Issues

Use the issue templates:

- **Bug report** — steps to reproduce, expected vs actual, logs, environment.
- **Feature request** — problem, proposed solution, alternatives, scope.
- **Question** — ask first before building something large.

Security vulnerabilities: do **not** open a public issue — see [SECURITY.md](SECURITY.md).

## Questions?

Open a [question issue](../../issues/new?template=question.yml).
