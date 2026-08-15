# Workforce Platform Agent Instructions

## Scope and precedence

- These instructions apply to the entire repository.
- A nested `AGENTS.md` adds rules for its directory. When rules conflict, follow the more specific
  rule unless it would weaken security, tenant isolation, data integrity, or required verification.
- Human instructions for the current task define scope. The roadmap supplies priority context; it
  does not authorize unrelated work.
- Do not modify or discard unrelated working-tree changes. Inspect `git status` before editing.

## Product and release context

- This is a multi-tenant workforce platform initially targeting Pakistan-based offices with 5-20
  desk-based employees.
- Read `docs/product/feature-catalog.md` before defining or materially changing product behavior.
- Read `docs/product/roadmap-2-month.md` when planning roadmap work or choosing between scoped
  alternatives.
- General-availability requirements and beta/deferred labels in those documents are intentional.
  Do not silently promote, remove, or expand them.

## Required documentation

Read the documents relevant to the change before planning implementation:

- Architecture or cross-service changes: `docs/architecture/overview.md` and applicable ADRs under
  `docs/adr/`.
- Database or persisted-domain changes: `docs/architecture/data-model.md` and
  `docs/development/database-changes.md`.
- Portal work: `docs/architecture/portal-module-structure.md`.
- Device gateway or firmware work: `docs/architecture/device-protocol.md`.
- Approval behavior: `docs/architecture/approval-workflow.md`.
- Deployment or infrastructure: `docs/deployment/vps-nginx.md` and `SECURITY.md`.

If code and documentation disagree, stop and reconcile them in the same change. Update feature,
architecture, setup, security, or deployment documentation whenever behavior or an operational
contract changes.

## Architecture boundaries

- `apps/portal` owns human-facing workflows and its server-side application API.
- `apps/device-gateway` accepts authenticated device traffic only; it is not a general portal API.
- `apps/worker` owns durable background and scheduled work.
- `apps/firmware` owns ESP32/scanner behavior. Fingerprint templates remain on the scanner.
- `packages/attendance-core` owns framework-independent attendance and leave rules.
- `packages/shared` owns cross-service schemas and types, not feature-specific UI contracts.
- `packages/db` owns Prisma schema, migrations, client construction, and data scripts.
- Move code into a shared package only when at least two consumers genuinely need the same
  contract or pure logic.

## Non-negotiable domain invariants

- Every customer-owned record, query, mutation, job, cache key, file, export, and device operation
  must be scoped to an organization. Never trust a client-supplied ID without proving it belongs to
  the active organization.
- Treat a person, login account, organization membership, and employment as different lifecycles.
- Preserve employment, assignment, reporting-line, role, policy, and schedule history with
  effective dates. Do not overwrite history for convenience.
- Treat raw scan events as immutable evidence. Apply approved corrections as separate auditable
  records.
- Enforce both capability and resource scope on the server. Hiding navigation is not authorization.
- Do not authorize from display role names or add broad owner/admin shortcuts. Use stable
  permissions and `SELF`, direct-report, unit-tree, or organization scopes.
- Release flags control rollout and emergency shutdown. Subscription entitlements control paid
  access. Evaluate and enforce both on the server; do not conflate them.
- Prevent self-approval and preserve immutable approval decisions. Workflow changes affect new
  instances unless an explicit, reviewed migration says otherwise.
- Make scans, imports, accruals, notifications, exports, worker jobs, and billing webhooks
  idempotent.
- Store instants in UTC and render them in the effective assignment or organization timezone.
  Treat calendar dates separately from instants.

## Database changes

- Follow `docs/development/database-changes.md` for every schema, migration, constraint, enum,
  index, relation, or seed change.
- Never use `prisma db push` for a shared schema. Never edit, rename, reorder, or delete an applied
  migration.
- Use expand-migrate-contract for destructive or compatibility-sensitive changes.
- Backfill tenant ownership explicitly and verify cross-tenant isolation before enabling a module.
- Validate cross-model and effective-date invariants inside the same transaction; add database
  constraints where PostgreSQL can express them reliably.
- Update the data-model document, migrations, development/E2E seeds, and clear script together
  when they are affected.

## Security and privacy

- Never commit or print real secrets, session tokens, passwords, device credentials, personal
  records, biometric data, database dumps, or production payloads.
- Validate untrusted input at every boundary. Authentication, authorization, tenant scope, and
  entitlement checks must occur before protected reads or writes.
- Return stable safe errors to clients. Keep internal exceptions, SQL details, secrets, and stack
  traces in appropriately redacted server logs only.
- Use secure password hashing, signed/rotatable credentials, rate limits, safe cookies/headers, and
  explicit session revocation for authentication work.
- Validate file type and size, authorize every download, use non-guessable storage keys, and record
  retention/audit behavior for uploaded files.
- Add an audit event for security-, access-, employee-, approval-, export-, billing-, and
  configuration-sensitive mutations.

## Implementation expectations

- Use pnpm and the existing workspace scripts. Do not introduce another package manager.
- Prefer the smallest complete vertical change over broad scaffolding or speculative abstraction.
- Reuse existing patterns and dependencies. New production dependencies require a concrete
  justification and review of maintenance, licensing, security, and bundle/runtime impact.
- Keep TypeScript strict. Avoid `any`, unchecked casts, and duplicated persistence types. Validate
  JSON contracts with Zod or an equivalent existing boundary schema.
- Keep UI, domain rules, persistence, and authorization concerns separable and testable.
- Do not weaken lint rules, coverage, authorization, validation, or tests to make generated code
  pass.
- Do not leave silent placeholders, fake success paths, untracked TODOs, or mock production data.
  If scope is intentionally incomplete, gate it and document the limitation.
- Preserve backward compatibility for deployed clients and devices or document and implement a
  versioned migration path.

## Verification

Run focused checks while developing, then run every applicable repository check before declaring
completion:

```bash
pnpm --filter @attendance/db exec prisma validate
pnpm db:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
```

- Run `pnpm e2e` for critical authentication, tenant, employee, attendance, leave, approval,
  entitlement, subscription, or other user-visible workflow changes.
- Run `pnpm firmware:test` and `pnpm firmware:build` for firmware changes; run device tests when
  hardware is available.
- Rehearse both clean-database and existing-data migration paths for database changes.
- Add negative tests for cross-tenant IDs, insufficient resource scope, missing entitlement,
  duplicate delivery, and invalid transitions when relevant.
- Documentation-only changes require at least formatting and link/path review.
- Never claim a command passed if it was not run successfully. Report skipped, blocked, flaky, or
  failed checks explicitly with the reason.

## Definition of done

A change is complete only when:

- requested acceptance criteria are met without unrelated scope;
- tenant isolation, authorization, entitlements, validation, audit, and idempotency were considered;
- applicable tests cover success, boundary, failure, and replay behavior;
- migrations and operational rollback/forward-fix implications are reviewed;
- affected documentation and examples are updated;
- generated code has been read and reviewed for correctness; and
- the handoff lists changed behavior, verification evidence, known limitations, and rollout needs.
