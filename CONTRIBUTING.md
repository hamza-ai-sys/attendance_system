# Contributing

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
`pnpm dev`. The migration command is safe to run when no migrations are pending. Do not seed
the database after every pull.

## Before Opening A Pull Request

Run the same checks CI runs:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For firmware changes, also run:

```bash
pnpm firmware:build
```

## Database Changes

- Change `packages/db/prisma/schema.prisma`.
- Keep datasource URLs in `packages/db/prisma.config.ts`, not in `schema.prisma`.
- Create and commit a migration under `packages/db/prisma/migrations`.
- Use `pnpm db:migrate` locally.
- Use `pnpm db:migrate:deploy` on production.
- Do not edit a migration after it has been applied to a shared environment.

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
- `apps/dashboard` owns human-facing workflows.
- `apps/worker` owns background work.
- Shared code belongs in `packages/*` only when at least two services need it.

## Dashboard Modules

Dashboard route work must follow the feature-local structure described in
[`docs/architecture/dashboard-module-structure.md`](docs/architecture/dashboard-module-structure.md).
Keep route pages thin, put feature UI in `_components`, pure feature logic in `_lib`, and keep
queries, permissions, actions, and types in modules named for those responsibilities.

## Dashboard Component Size Limits

Dashboard React modules are limited to 250 effective lines. Ordinary functions are limited to 50
effective lines, while named React components are limited to 100. Blank lines and comment-only
lines do not count. The limits are enforced by ESLint during `pnpm lint`.

When a component reaches the limit, extract cohesive UI sections, modals, stateful workflows, or
shared types into nearby modules. Do not disable the rule to make a new component pass; a local
disable should be reserved for exceptional generated or declarative code and explained in the
same file.
