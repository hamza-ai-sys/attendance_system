# ADR 0001: Monorepo Boundaries

## Status

Accepted.

## Context

The platform includes human-facing workflows, hardware-facing communication, background work,
firmware, persistence, and shared domain rules. Putting these responsibilities into one deployable
application would couple hardware ingestion, interactive web requests, and scheduled processing,
making security boundaries, failure isolation, and independent evolution harder.

## Decision

Use a pnpm workspace monorepo with separate apps for firmware, device gateway,
portal, and background worker.

`device-gateway` is not a general portal API. It is scoped to device communication.
The portal is a full-stack Next.js app and owns human workflows.

## Alternatives

- A single application for portal, device ingestion, and scheduled work was rejected because it
  would mix trust boundaries and couple interactive availability to hardware/background workloads.
- Independent repositories were rejected because the shared schemas, domain rules, and coordinated
  protocol changes benefit from atomic changes and one verification workflow.

## Consequences

- The device gateway stays small and easier to secure.
- Portal logic can evolve independently from hardware ingestion.
- Background jobs can run without coupling them to web request lifecycles.
- Shared packages hold common schemas, database access, and attendance rules.
