# Workforce Platform

Workforce management platform with an ESP32 fingerprint attendance integration.

## Projects

- `apps/firmware`: ESP32 C++ firmware using PlatformIO.
- `apps/device-gateway`: Express service used only by ESP32 devices.
- `apps/portal`: Next.js human-facing workforce portal.
- `apps/worker`: background jobs, notifications, reports, and cleanup.
- `packages/db`: Prisma schema, database client, migrations, and seed data.
- `packages/shared`: shared schemas and types.
- `packages/attendance-core`: attendance derivation rules.
- `packages/config`: shared configuration placeholders.

## First Run For Local Development

See `docs/development/getting-started.md` for the full development guide.

```bash
pnpm install
cp .env.dev.example .env
cp apps/portal/.env.dev.example apps/portal/.env
cp apps/device-gateway/.env.dev.example apps/device-gateway/.env
pnpm docker:dev:db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

This starts only PostgreSQL in Docker and runs the TypeScript apps locally with watch mode.
The root `.env` contains shared infrastructure and tooling values. Each app-level `.env`
contains only settings owned by that app, such as its port.

## Run The Whole Stack In Docker

```bash
pnpm docker:dev:db:up
pnpm db:migrate
pnpm db:seed
pnpm docker:dev:up
```

When using `pnpm docker:dev:up`, do not also run `pnpm dev` unless you stop the app containers
or change ports. The Docker stack already starts `portal`, `device-gateway`, and
`worker`.

## Useful Commands

The full command reference is in `docs/development/getting-started.md`.

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
pnpm build
pnpm format
pnpm db:studio
pnpm docker:dev:db:up
pnpm docker:dev:logs
pnpm docker:prod:config
pnpm firmware:build
pnpm firmware:test
pnpm firmware:upload
pnpm firmware:monitor
pnpm firmware:clean
```

`pnpm docker:dev:up` starts all development Docker services in detached mode. Use
`pnpm docker:dev:logs` to watch container output, and `pnpm docker:dev:down` to stop the
local stack.

## Deployment

The production target is Docker Compose on an Ubuntu VPS behind nginx.

- Use `.env.prod.example` as the template for `.env.prod`.
- Validate production Compose with `pnpm docker:prod:config`.
- Apply database migrations with `pnpm db:migrate:deploy`.
- Use `infra/nginx/workforce-portal.conf` as the nginx starting point.

See `docs/deployment/vps-nginx.md` for the full runbook.

## Development Docs

- `docs/development/getting-started.md`: local setup, workflows, Prisma, firmware, and troubleshooting.
- `docs/architecture/data-model.md`: database domains, relationships, invariants, and known gaps.
- `docs/development/database-changes.md`: required schema, migration, seed, documentation, and verification workflow.
- `docs/development/onboarding-checklist.md`: checklist for new engineers.
- `docs/product/feature-catalog.md`: product scope, current implementation status, feature definitions, and packaging hypothesis.
- `docs/product/roadmap-2-month.md`: August 17 through October 16, 2026 delivery roadmap, weekly goals, and launch gates.
- `CONTRIBUTING.md`: pull request and contribution expectations.
- `SECURITY.md`: secrets, device request security, and production safety rules.

## Service Boundaries

`device-gateway` is hardware-facing. It accepts heartbeats, scan events, and enrollment
results. Heartbeat responses carry the desired device mode and enrollment work.

`portal` is human-facing. It owns employee management, attendance views, manual
attendance requests, approvals, notification inboxes, and reports.

`worker` reacts to durable records and time-based rules. It handles reminders, anomaly
detection, report generation, email delivery, and maintenance tasks.
