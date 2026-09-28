# Security Policy

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.** Instead, use
GitHub's [private vulnerability reporting](../../security/advisories/new) with:

- Description of the vulnerability
- Steps to reproduce / proof of concept
- Affected version / commit and environment

You will receive an acknowledgment within 72 hours. We will keep you informed
of the fix timeline and credit you (unless you prefer to stay anonymous).

## Supported Versions

| Version                 | Supported                      |
| ----------------------- | ------------------------------ |
| `main` (latest release) | Yes                            |
| `dev`                   | Yes (best effort, pre-release) |
| Older releases          | No — please upgrade            |

## Scope

- `apps/backend` (Core API, port 3001) — auth, JWT, cookies
- `apps/erp` (ERP API, port 3002) — company-scoped data, auth delegation to Core
- `apps/frontend` (Next.js, port 3000) — BFF proxy routes, cookie handling
- `apps/ai` (FastAPI, port 3003) — AI service
- `packages/backend`, `packages/shared` — shared Express infra and contracts

Out of scope: third-party dependencies (report upstream), social engineering,
physical attacks, and deployments you operate yourself without following our
setup docs.

## Handling Secrets

Never commit secrets (`.env`, tokens, keys, certificates). If you accidentally
push one, rotate it immediately and report it via private vulnerability
reporting (see above).
