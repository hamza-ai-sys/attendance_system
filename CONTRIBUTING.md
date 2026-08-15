# Contributing

## AI-Assisted Development

AI-assisted changes must follow the canonical root and directory-specific `AGENTS.md` files.

- Codex loads the `AGENTS.md` hierarchy directly.
- Claude Code loads the checked-in `CLAUDE.md` adapters, which import the corresponding
  `AGENTS.md` files.
- Antigravity loads `.agents/rules/project-governance.md`, which requires the same instruction
  hierarchy and task-specific documentation.

Instruction files guide the tools; they do not replace engineering review. The pull request author
is responsible for reading all generated code, validating assumptions, running applicable checks,
and reporting failures or skipped verification accurately. Do not merge generated code merely
because an agent reports success.

## Local Setup

Read `docs/development/getting-started.md` before starting. The recommended daily workflow
is PostgreSQL in Docker with the apps running locally:

```bash
pnpm install
cp .env.dev.example .env
pnpm docker:dev:db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Use `pnpm docker:dev:up` only when you intentionally want the whole stack running in Docker.
Do not run `pnpm dev` at the same time as the full Docker stack unless you have changed
ports or stopped the app containers.

## After Pulling Main

After a pull request is merged and you pull `main`, follow the post-pull workflow in
[`docs/development/getting-started.md`](docs/development/getting-started.md#after-pulling-main).
In short: run `pnpm install`, start the local database, run `pnpm db:migrate`, and then run
`pnpm db:seed` before `pnpm dev`. Migrations are a no-op when none are pending, and the
development seed is safe to repeat, so engineers do not need to inspect merged pull requests
for database or seed changes.

## Before Opening A Pull Request

Run the same checks CI runs:

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

For firmware changes, also run:

```bash
pnpm firmware:build
```

## Database Changes

The current structure and model boundaries are documented in
[`docs/architecture/data-model.md`](docs/architecture/data-model.md). Every database change must
follow [`docs/development/database-changes.md`](docs/development/database-changes.md).

At minimum, a database pull request must:

- include and review a committed migration under `packages/db/prisma/migrations`;
- preserve existing data or explicitly document an approved destructive change;
- update the development/E2E seeds and clear script when affected;
- update the data-model and feature documentation in the same pull request;
- verify both the existing-data upgrade and clean-database paths; and
- pass Prisma validation, lint, typecheck, tests, build, and formatting checks.

Keep datasource URLs in `packages/db/prisma.config.ts`, not in `schema.prisma`. Use
`pnpm db:migrate` locally and `pnpm db:migrate:deploy` in production. Never edit a migration after
it has been applied to a shared environment, and never use the development seed for a required
cross-environment backfill.

## Environment And Secrets

- Use the root `.env` for shared infrastructure and tooling values.
- Keep app-owned values, such as ports and service-specific secrets, in that app's `.env`.
- Do not duplicate shared values such as `DATABASE_URL` in app env files.
- Do not create package-level `.env` files.
- Runtime packages receive configuration from their importing app. Prisma CLI configuration
  and the seed script are executable tooling and may load the root `.env`.
- Do not commit `.env`, `.env.prod`, firmware `config.h`, database dumps, or real keys.
- The bundled seed is development-only and must not be run in production.

## Service Boundaries

- `apps/device-gateway` is only for device traffic.
- `apps/portal` owns human-facing workflows.
- `apps/worker` owns background work.
- Shared code belongs in `packages/*` only when at least two services need it.

## Portal Modules

Portal route work must follow the feature-local structure described in
[`docs/architecture/portal-module-structure.md`](docs/architecture/portal-module-structure.md).
Keep route pages thin, put feature UI in `_components`, pure feature logic in `_lib`, and keep
queries, permissions, actions, and types in modules named for those responsibilities.

## Portal Component Size Limits

Portal React modules are limited to 250 effective lines. Ordinary functions are limited to 50
effective lines, while named React components are limited to 100. Blank lines and comment-only
lines do not count. The limits are enforced by ESLint during `pnpm lint`.

When a component reaches the limit, extract cohesive UI sections, modals, stateful workflows, or
shared types into nearby modules. Do not disable the rule to make a new component pass; a local
disable should be reserved for exceptional generated or declarative code and explained in the
same file.
