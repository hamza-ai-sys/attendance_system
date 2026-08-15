# Contribution Guide

## Before Editing

1. Read [`getting-started.md`](getting-started.md) and the documentation relevant to the change.
2. Inspect `git status` and preserve unrelated changes.
3. Confirm the requested acceptance criteria, affected service boundary, tenant and authorization
   impact, rollout state, and verification plan.
4. Use the current product scope in [`../product/feature-catalog.md`](../product/feature-catalog.md)
   and roadmap in [`../product/roadmap-2-month.md`](../product/roadmap-2-month.md) as context. They do
   not authorize unrelated scope.
5. If the work introduces or changes an architectural decision, follow the policy in
   [`../architecture/decisions/`](../architecture/decisions/).

AI-assisted work must also follow [`ai-assisted-development.md`](ai-assisted-development.md). The
author remains responsible for reviewing generated code and verifying correctness.

## Implementation Expectations

- Prefer the smallest complete vertical change over broad scaffolding or speculative abstraction.
- Reuse established patterns and dependencies. A new production dependency needs a concrete
  justification covering maintenance, licensing, security, and runtime/bundle impact.
- Keep TypeScript strict. Avoid `any`, unchecked casts, and duplicated persistence types.
- Validate untrusted JSON, forms, API payloads, and device messages at their boundary.
- Keep UI, domain rules, persistence, authorization, and external effects separable and testable.
- Do not weaken lint rules, coverage thresholds, validation, authorization, or tests to make a
  change pass.
- Do not leave silent placeholders, fake success paths, or untracked TODOs. Gate and document an
  intentionally incomplete feature.
- Preserve compatibility for deployed clients and devices or provide a reviewed versioned
  migration path.

## Service Boundaries

- `apps/portal` owns human-facing workflows and its server-side application API.
- `apps/device-gateway` accepts authenticated hardware traffic only.
- `apps/worker` owns durable asynchronous and scheduled work.
- `apps/firmware` owns ESP32 and scanner behavior.
- `packages/attendance-core` owns framework-independent attendance and leave rules.
- `packages/shared` owns schemas and types shared across services.
- `packages/db` owns Prisma schema, migrations, database client construction, and data scripts.
- Move code into a shared package only when at least two consumers need the same contract or pure
  logic.

Portal modules must follow [`portal-development-guidelines.md`](portal-development-guidelines.md).
Database changes must follow [`database-changes.md`](database-changes.md).

## Environment and Secrets

- Use the root `.env` for shared infrastructure/tooling configuration.
- Keep app-owned configuration in that app's `.env`.
- Do not create package-level `.env` files or duplicate shared values such as `DATABASE_URL`.
- Use only committed example files for placeholders. Never commit real credentials, firmware
  `config.h`, database dumps, or production payloads.
- The development seed is not a production deployment mechanism.

See [`security.md`](security.md) for the complete secure-development requirements.

## Pull Requests

A pull request must:

- describe the user-visible outcome, explicit non-goals, and roadmap/issue context;
- keep unrelated changes out of the diff;
- include tests for success, boundary, failure, authorization, and replay behavior as applicable;
- include and verify migrations, seeds, documentation, rollout flags, and entitlements when
  affected;
- add or update an ADR for an architectural decision, or explain why the change is not
  architectural;
- report commands actually run and disclose failed, skipped, flaky, or blocked verification; and
- describe risks, compatibility, backfill, rollout, and forward-fix behavior.

Follow [`testing.md`](testing.md) for verification commands. Do not merge a change solely because
an AI agent or a local happy path reports success.
