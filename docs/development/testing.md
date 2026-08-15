# Testing and Verification

## Test Categories

The root commands intentionally name the test layer:

| Category                 | Command                     | What it covers                                                                                                                                       |
| ------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit and service-level   | `pnpm test:unit`            | Vitest projects for portal, gateway, worker, attendance-core, database package, and shared schemas. It does not start a browser or the E2E database. |
| Unit coverage            | `pnpm test:unit:coverage`   | The same Vitest suites with V8 coverage and repository thresholds.                                                                                   |
| Browser E2E              | `pnpm test:e2e`             | Playwright against a real portal process and a fresh isolated PostgreSQL database.                                                                   |
| E2E browser installation | `pnpm test:e2e:install`     | Installs the Chromium binary used by Playwright.                                                                                                     |
| Firmware native          | `pnpm firmware:test`        | Hardware-independent firmware logic through PlatformIO's native environment.                                                                         |
| Firmware device          | `pnpm firmware:test:device` | Smoke tests requiring a connected ESP32/scanner environment.                                                                                         |

Package-level `test` scripts are internal workspace task names. Developers should use the explicit
root commands above when reporting repository verification.

## During Development

- Run the narrowest relevant Vitest project or test file while iterating.
- Add tests for success, empty/boundary, validation failure, authorization failure, tenant
  mismatch, missing entitlement, duplicate delivery, invalid transition, and recovery behavior
  when those cases apply.
- Test pure domain logic independently of React, Prisma, network calls, and time where practical.
- Do not make tests pass by weakening assertions, skipping cases, lowering thresholds, or encoding
  implementation details instead of behavior.

## Before Pull Request Handoff

Run the applicable repository checks:

```bash
pnpm lint
pnpm typecheck
pnpm docs:check
pnpm test:unit
pnpm build
pnpm format:check
```

Also run:

- `pnpm test:e2e` for critical authentication, tenant, employee, attendance, leave, approval,
  entitlement, subscription, or other user-visible workflow changes;
- Prisma validation, generation, and migration rehearsals described in
  [`database-changes.md`](database-changes.md) for database changes; and
- firmware native/build/device checks for firmware changes.

Never claim a command passed unless it completed successfully. Record skipped, blocked, flaky, or
failed checks with the reason and relevant output.

## E2E Environment

Install Chromium once:

```bash
pnpm test:e2e:install
```

`pnpm test:e2e` starts PostgreSQL from `docker-compose.e2e.yml` on port `55432`, applies committed
migrations, loads the deterministic E2E seed, starts the portal on port `3100`, runs Playwright,
and removes the container and temporary database even after failures. It does not use the normal
development database.

Override occupied ports when needed:

```bash
E2E_POSTGRES_PORT=55433 E2E_PORTAL_PORT=3101 pnpm test:e2e
```

## Coverage

`pnpm test:unit:coverage` writes the browsable report to `coverage/index.html` and fails below the
thresholds in `vitest.config.ts`. V8 does not instrument ESP32 C++; firmware coverage must come from
native logic tests and targeted device verification.
