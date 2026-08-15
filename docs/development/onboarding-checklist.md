# Engineer Onboarding Checklist

Use this checklist when a new engineer joins the project.

## Access

- [ ] Repository access confirmed.
- [ ] Docker installed and running.
- [ ] Node.js 24+ installed.
- [ ] Corepack enabled.
- [ ] pnpm available.
- [ ] VS Code recommended extensions installed.
- [ ] PlatformIO installed if working on firmware.

## First Local Run

- [ ] Read `README.md`.
- [ ] Read `docs/development/getting-started.md`.
- [ ] Create root and app `.env` files from their `.env.dev.example` templates.
- [ ] Run `pnpm install`.
- [ ] Run `pnpm docker:dev:db:up`.
- [ ] Run `pnpm db:migrate`.
- [ ] Run `pnpm db:seed`.
- [ ] Run `pnpm dev`.
- [ ] Open the portal at `http://localhost:3000`.
- [ ] Open gateway health check at `http://localhost:4001/healthz`.

## Verification

- [ ] Run `pnpm lint`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test:unit`.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm firmware:build` if working on firmware.

## Project Context

- [ ] Read `docs/development/contributing.md`.
- [ ] Read `docs/development/testing.md`.
- [ ] Read `docs/development/security.md`.
- [ ] Read `docs/architecture/overview.md`.
- [ ] Read `docs/architecture/data-model.md`.
- [ ] Read `docs/architecture/decisions/README.md`.
- [ ] Read `docs/development/database-changes.md` before making a database change.
- [ ] Read `docs/architecture/device-protocol.md`.

## Before First Pull Request

- [ ] Confirm service boundary for the change.
- [ ] Add or update tests for changed behavior.
- [ ] Include Prisma migration if schema changed.
- [ ] Update database documentation and seeds if schema changed.
- [ ] Document any new environment variables.
- [ ] Confirm no real secrets are committed.
