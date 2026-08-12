# Development Guide

This guide is the first stop for engineers working on the attendance system.

The repo is a pnpm monorepo with:

- `apps/dashboard`: Next.js dashboard for employees, managers, HR, and owners.
- `apps/device-gateway`: Express API used by ESP32 devices only.
- `apps/worker`: background jobs.
- `apps/firmware`: ESP32 firmware using PlatformIO.
- `packages/db`: Prisma schema, migrations, seed, and database client.
- `packages/shared`: shared schemas and types.
- `packages/attendance-core`: attendance rules.

## Prerequisites

Install these before starting:

- Node.js 24 or newer.
- pnpm 11.10.0 through Corepack.
- Docker Desktop or Docker Engine with the Compose plugin.
- Git.
- VS Code is recommended.

For firmware work, also install:

- PlatformIO CLI or the VS Code PlatformIO extension.
- Microsoft C/C++ VS Code extension.

Recommended VS Code extensions are listed in `.vscode/extensions.json`.

## First-Time Setup

From the repo root:

```bash
pnpm install
cp .env.dev.example .env
cp apps/dashboard/.env.dev.example apps/dashboard/.env
cp apps/device-gateway/.env.dev.example apps/device-gateway/.env
pnpm docker:dev:db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

This is the recommended development workflow. It starts only PostgreSQL in Docker and runs
the TypeScript apps locally with watch mode.

Default local URLs:

- Dashboard: `http://localhost:3000`
- Device gateway health check: `http://localhost:4001/healthz`
- PostgreSQL: `localhost:5432`

## Development Workflows

The Compose files are independent so environment-specific defaults and data cannot leak
between them:

| File                      | Purpose                                      | Data lifecycle                 |
| ------------------------- | -------------------------------------------- | ------------------------------ |
| `docker-compose.dev.yml`  | Local PostgreSQL or the complete local stack | Persistent development volume  |
| `docker-compose.e2e.yml`  | PostgreSQL for host-run Playwright tests     | Temporary in-memory filesystem |
| `docker-compose.prod.yml` | Complete VPS production stack                | Persistent production volume   |

The E2E file intentionally contains only PostgreSQL. The E2E runner starts the dashboard
directly from the working tree so tests avoid rebuilding a Docker image after every source
change. Development and production contain the complete service set because they support
running the deployed application topology.

### After Pulling Main

After a merged pull request reaches `main`, update your local checkout and run the following
from the repo root:

```bash
pnpm install
pnpm docker:dev:db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

`pnpm install` picks up lockfile changes and regenerates the Prisma client through the
repository's postinstall script. `pnpm db:migrate` applies any committed migrations to your
local database; when there are no pending migrations, it is a safe no-op. You therefore do
not need to inspect each merged pull request before running this sequence.

`pnpm db:seed` is also part of every post-pull sync. The development seed is repeatable: it
updates or recreates seed-owned fixtures and leaves unrelated local application data intact.
This ensures seed-script changes reach every engineer without requiring them to inspect the
merged pull request. Do not run `pnpm db:clear` routinely; it deletes all local application
data and is only needed when you intentionally want a clean dataset.

If you use the full-stack Docker workflow, replace `pnpm dev` with `pnpm docker:dev:up` so the
application images are rebuilt from the pulled code. Still run `pnpm db:migrate` and
`pnpm db:seed` before starting the stack.

### Recommended: Database In Docker, Apps Local

Use this for daily feature development:

```bash
pnpm docker:dev:db:up
pnpm dev
```

Why this workflow:

- Next.js, Express, and worker processes restart faster.
- Logs stay in your terminal.
- TypeScript watch mode is easier to debug.
- Only Postgres runs in Docker.

### Full Stack In Docker

Use this when checking container behavior:

The application containers use their built production start commands so this workflow
matches deployment behavior; it is not a hot-reload workflow. “Development” here refers to
the local credentials, ports, and database volume.

```bash
pnpm docker:dev:db:up
pnpm db:migrate
pnpm db:seed
pnpm docker:dev:up
pnpm docker:dev:logs
```

Do not run `pnpm dev` while the full Docker stack is up unless you stop the app containers
or change ports. The Docker stack already starts `dashboard`, `device-gateway`, and
`worker`.

Stop Docker services with:

```bash
pnpm docker:dev:down
```

## Common Commands

| Command                     | Purpose                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                  | Run all TypeScript apps locally in watch mode.                |
| `pnpm dev:dashboard`        | Run only the dashboard.                                       |
| `pnpm dev:device-gateway`   | Run only the device gateway.                                  |
| `pnpm dev:worker`           | Run only the worker.                                          |
| `pnpm docker:dev:db:up`     | Start only development PostgreSQL in Docker.                  |
| `pnpm docker:dev:db:stop`   | Stop only development PostgreSQL without deleting its data.   |
| `pnpm docker:dev:up`        | Start PostgreSQL and all app services for local development.  |
| `pnpm docker:dev:logs`      | Follow development container logs.                            |
| `pnpm docker:dev:down`      | Stop the local development stack.                             |
| `pnpm db:clear`             | Delete all development data while preserving the schema.      |
| `pnpm db:migrate`           | Create/apply local Prisma migrations.                         |
| `pnpm db:migrate:deploy`    | Apply committed migrations in production/shared environments. |
| `pnpm db:seed`              | Seed development-only data.                                   |
| `pnpm db:studio`            | Open Prisma Studio.                                           |
| `pnpm lint`                 | Run ESLint through Turbo.                                     |
| `pnpm typecheck`            | Run TypeScript checks through Turbo.                          |
| `pnpm test`                 | Run all TypeScript tests and generate coverage.               |
| `pnpm e2e`                  | Run dashboard E2E tests with a fresh isolated database.       |
| `pnpm e2e:install`          | Install the Chromium browser used by Playwright.              |
| `pnpm build`                | Build all packages/apps.                                      |
| `pnpm format`               | Format the repo with Prettier.                                |
| `pnpm firmware:build`       | Build the ESP32 firmware.                                     |
| `pnpm firmware:test`        | Run firmware logic tests on the development machine.          |
| `pnpm firmware:test:device` | Run firmware smoke tests on a connected ESP32.                |
| `pnpm firmware:upload`      | Build and upload firmware to a connected ESP32.               |
| `pnpm firmware:monitor`     | Monitor serial output from a connected ESP32.                 |
| `pnpm firmware:clean`       | Remove PlatformIO firmware build artifacts.                   |

To rebuild the local development data after the seed changes, clear the existing
application records and run the seed again:

```bash
pnpm db:clear
pnpm db:seed
```

The cleanup is transactional, preserves migrations and schema objects, and refuses to run
when `NODE_ENV=production`.

Before opening a pull request, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Dashboard E2E Tests

Install the Playwright browser once, then run the E2E suite:

```bash
pnpm e2e:install
pnpm e2e
```

The E2E runner starts PostgreSQL from `docker-compose.e2e.yml` on port `55432`, applies
committed migrations, loads the deterministic E2E seed, starts the dashboard on port
`3100`, and runs Playwright. It removes the container and its temporary database when the
suite finishes, including after test failures. The normal development database and its
named volume are not used or modified.

Override the default ports when they are already occupied:

```bash
E2E_POSTGRES_PORT=55433 E2E_DASHBOARD_PORT=3101 pnpm e2e
```

`pnpm test` prints a consolidated coverage summary and writes the browsable HTML report to
`coverage/index.html`. The command fails if coverage drops below the thresholds in
`vitest.config.ts`. Firmware logic tests use PlatformIO and remain available through
`pnpm firmware:test`; V8 coverage cannot instrument ESP32 C++.

For firmware changes, also run:

```bash
pnpm firmware:build
```

## Environment Files

Use the `.env.dev.example` templates for local development:

```bash
cp .env.dev.example .env
cp apps/dashboard/.env.dev.example apps/dashboard/.env
cp apps/device-gateway/.env.dev.example apps/device-gateway/.env
```

Rules:

- The root `.env` contains shared infrastructure and tooling values.
- App `.env` files contain only app-owned values such as ports and service-specific secrets.
- Do not duplicate shared values such as `DATABASE_URL` in app env files.
- Do not create package-level `.env` files.
- Runtime packages receive configuration from their importing app. Prisma CLI configuration
  and the seed script may load the root `.env` because they are executable tooling.
- Never commit `.env`, `.env.prod`, firmware `config.h`, database dumps, or real keys.
- `.env.prod.example` is only a template for VPS deployment.
- The bundled seed is development-only and must not be run in production.

Important shared local env values:

- `DATABASE_URL`: used by Prisma and app services.
- `DEV_DEVICE_SECRET`: secret for the seeded development ESP32 device.

Important app-owned values:

- `apps/dashboard/.env`: `PORT` and `SESSION_SECRET`.
- `apps/device-gateway/.env`: `PORT` and `DEVICE_SIGNATURE_MAX_AGE_SECONDS`.

## Database And Prisma

The Prisma schema lives at:

```text
packages/db/prisma/schema.prisma
```

Prisma configuration lives at:

```text
packages/db/prisma.config.ts
```

Executable database data scripts live under `packages/db/scripts`:

- `seed-development.ts` creates development accounts, sample attendance data, and Shaheer's scans.
- `seed-e2e.ts` creates the minimal deterministic fixtures used by Playwright.
- `clear-development.ts` removes all application data while preserving the schema and migrations.

The development seed is part of the standard post-pull workflow and must remain safe to run
repeatedly. Seed-script changes should upsert stable fixtures or replace only records clearly
owned by the seed. They must not require engineers to clear their databases or silently remove
unrelated local data. Schema changes and data backfills required in every environment belong in
a committed migration, not in the development seed.

This repo uses Prisma 7 style configuration:

- `schema.prisma` declares the provider.
- `prisma.config.ts` supplies the datasource URL for Prisma CLI commands.
- Runtime Prisma clients use the PostgreSQL driver adapter in `packages/db/src/client.ts`.

When changing the database:

1. Edit `packages/db/prisma/schema.prisma`.
2. Create a migration:

   ```bash
   pnpm db:migrate
   ```

3. Review and commit the generated migration under `packages/db/prisma/migrations`.
4. Regenerate the client if needed:

   ```bash
   pnpm db:generate
   ```

5. Run checks:

   ```bash
   pnpm typecheck
   pnpm test
   ```

Do not edit a migration after it has been applied to a shared environment. Create a new
migration instead.

## Device Gateway Development

Device endpoints live under:

```text
apps/device-gateway/src/routes/device-routes.ts
```

Device requests must include:

- `x-device-id`
- `x-device-timestamp`
- `x-device-signature`

The HMAC signing contract is documented in:

```text
docs/architecture/device-protocol.md
```

The development seed creates:

- Device id: `esp32-dev-001`
- Device secret: `dev-device-secret`

Only the SHA-256 hash of the secret is stored in the database.

## Dashboard Development

Dashboard code lives under:

```text
apps/dashboard/src
```

The current session-token helper is in:

```text
apps/dashboard/src/lib/session-token.ts
apps/dashboard/src/lib/session.ts
```

The next major dashboard work should build on this:

- login/logout
- password hashing
- protected routes
- employee management
- device provisioning
- attendance views
- manual correction and approval workflows

## Worker Development

Worker code lives under:

```text
apps/worker/src
```

Before adding real jobs, define:

- whether the job can run more than once at the same time
- retry behavior
- failure logging
- idempotency rules
- whether a database lock is required

Use `JobRun` for durable job audit records.

## Firmware Development

Firmware code lives under:

```text
apps/firmware
```

Create local firmware config:

```bash
cp apps/firmware/include/config.example.h apps/firmware/include/config.h
```

`config.h` is ignored by Git because it can contain Wi-Fi and device secrets.
It is a device-provisioning file, not another application environment file. Set its
`DEVICE_ID` and `DEVICE_SECRET` to the credentials provisioned in the database, and set
`GATEWAY_BASE_URL` to an address reachable from the ESP32 rather than `localhost`.

Build firmware:

```bash
pnpm firmware:build
```

Run firmware logic tests without a connected ESP32:

```bash
pnpm firmware:test
```

Run the embedded smoke tests on a connected ESP32:

```bash
pnpm firmware:test:device
```

Upload firmware to a connected ESP32:

```bash
pnpm firmware:upload
```

Monitor a connected device:

```bash
pnpm firmware:monitor
```

Remove PlatformIO build artifacts:

```bash
pnpm firmware:clean
```

If VS Code shows `cannot open source file "Arduino.h"`:

1. Install the recommended PlatformIO and C/C++ extensions.
2. Run:

   ```bash
   pnpm firmware:build
   ```

3. In VS Code, run `PlatformIO: Rebuild IntelliSense Index`.
4. Make sure `.vscode/settings.json` includes PlatformIO as the C/C++ configuration provider.

The ESP32 Arduino framework headers are downloaded by PlatformIO and are not committed to
this repo.

## Service Boundaries

Keep changes inside the right service:

- `device-gateway` is for hardware/device traffic only.
- `dashboard` owns human workflows.
- `worker` owns background jobs.
- `packages/shared` holds shared schemas and types.
- `packages/attendance-core` holds attendance rules.
- `packages/db` owns Prisma schema, migrations, seed data, and DB client setup.

Add code to a shared package only when at least two apps need it.

## Troubleshooting

### `docker:dev:up` does not return

`pnpm docker:dev:up` should run in detached mode. If a raw `docker compose up` command is used,
it will stay open and stream logs. Use another terminal or stop it with `Ctrl+C`.

### Port already in use

You may be running both workflows at once. Stop Docker services:

```bash
pnpm docker:dev:down
```

Then choose either `pnpm docker:dev:db:up` plus `pnpm dev`, or `pnpm docker:dev:up`.

### Docker daemon is not running

Start Docker Desktop or the Docker service, then retry the command.

### Prisma says datasource `url` is not supported

The repo uses Prisma 7 style config. The datasource URL belongs in
`packages/db/prisma.config.ts`, not in `schema.prisma`. Reload VS Code if the Prisma
extension is showing stale errors.

### Prisma says `DATABASE_URL` is required

Create `.env` from the example file:

```bash
cp .env.dev.example .env
```

Then rerun the command from the repo root.

### Device requests get `invalid_signature`

Check that the device signed the exact canonical string from
`docs/architecture/device-protocol.md`. The raw request body, path, method, timestamp, and
secret must all match.

### `Arduino.h` is missing

Run the firmware build once so PlatformIO downloads the ESP32 framework:

```bash
pnpm firmware:build
```

Then rebuild the PlatformIO IntelliSense index in VS Code.

## Useful Reading Order

New engineers should read these in order:

1. `README.md`
2. `docs/development/getting-started.md`
3. `docs/architecture/overview.md`
4. `docs/architecture/data-model.md`
5. `docs/architecture/device-protocol.md`
6. `CONTRIBUTING.md`
7. `SECURITY.md`
