# Workforce Platform

A multi-tenant workforce management platform for desk-based offices, with optional ESP32 attendance devices.

## Repository

- `apps/portal` — Next.js web application and application API
- `apps/device-gateway` — authenticated device HTTP ingestion and command service
- `apps/worker` — asynchronous job processing
- `apps/firmware` — attendance device firmware
- `packages/db` — Prisma schema, migrations, and database utilities

## Documentation

- [Development](docs/development/README.md) — setup, contribution workflow, testing, security, and AI-assisted development
- [Architecture](docs/architecture/README.md) — system design, boundaries, protocols, data model, and architecture decisions
- [Deployment](docs/deployment/README.md) — environments, operations, backups, and deployment security
- [Product](docs/product/README.md) — vision, scope, features, subscriptions, roadmap, and launch criteria

Start with the [development guide](docs/development/README.md). Contributors should also read [CONTRIBUTING.md](CONTRIBUTING.md), and security concerns should follow [SECURITY.md](SECURITY.md).
