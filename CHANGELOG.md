# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Sale invoice sharing: Share button on the invoice dialog (native share
  sheet with download fallback) and Send by Email with the invoice PDF
  attached (`POST /api/v1/sales/:id/send-invoice`).
- Frontend UI refresh: clean Linear-style app shell (solid sidebar, flat
  topbar, restrained indigo accent), redesigned auth/onboarding pages,
  dashboard, settings, and form pages; horizontal settings nav, pill-style
  tabs, EmptyState panels, reduced-motion support. No new dependencies.
- Provider-agnostic email infrastructure in the ERP API (`IEmailProvider`
  port, SMTP + Resend adapters, log provider for development) selected via
  `EMAIL_PROVIDER` with per-provider credentials in env (`SMTP_*`,
  `RESEND_API_KEY`).
- `BadGatewayError` (502) in `backend-p` for upstream provider failures.
- Open-source community files: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `SECURITY.md`, `SUPPORT.md`, issue/PR templates, Dependabot.
- License: Apache License 2.0 (`LICENSE`) — fully open source, commercial use allowed.
- README documentation: badges, contents guide, prerequisites, quick start,
  workspaces table, project structure, scripts table, roadmap, contributors,
  and support sections.

## [0.1.0] - 2026-09-28

### Added

- Initial Syntra ERP monorepo: Next.js frontend (3000), Core API (3001),
  ERP API (3002), AI chatbot API (3003).
- Shared contracts (`packages/shared`) and Express infra (`packages/backend`).
- Docker Compose PostgreSQL setup, Prisma migrations, Turbo CI.
