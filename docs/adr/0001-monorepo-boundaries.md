# ADR 0001: Monorepo Boundaries

## Status

Accepted.

## Decision

Use a pnpm workspace monorepo with separate apps for firmware, device gateway,
portal, and background worker.

`device-gateway` is not a general portal API. It is scoped to device communication.
The portal is a full-stack Next.js app and owns human workflows.

## Consequences

- The device gateway stays small and easier to secure.
- Portal logic can evolve independently from hardware ingestion.
- Background jobs can run without coupling them to web request lifecycles.
- Shared packages hold common schemas, database access, and attendance rules.
