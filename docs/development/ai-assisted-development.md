# AI-Assisted Development

This is the canonical instruction source for AI-assisted work in this repository. It applies to
Codex, Claude Code, Antigravity, other coding agents, and the humans reviewing their output.

## Tool Loading

- Codex loads the root and nearest nested `AGENTS.md` files. Those files point here and to the
  applicable component section.
- Claude Code loads the checked-in `CLAUDE.md` adapters, which import the corresponding
  `AGENTS.md` files.
- Antigravity loads `.agents/rules/project-governance.md`, which requires this document and the
  applicable component section.

Instruction files guide agent behavior; they cannot guarantee compliance. Repository checks,
review, and release gates decide whether work is acceptable.

## Required Reading

Before planning or editing, read the documents that own the affected contract:

| Change                                   | Required documents                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Product behavior or roadmap              | `docs/product/feature-catalog.md` and, when prioritizing work, `docs/product/roadmap-2-month.md` |
| Cross-service or structural architecture | `docs/architecture/overview.md` and `docs/architecture/decisions/`                               |
| Database or persisted domain             | `docs/architecture/data-model.md` and `docs/development/database-changes.md`                     |
| Portal module                            | `docs/architecture/portal-module-structure.md`                                                   |
| Device gateway or firmware               | `docs/architecture/device-protocol.md`                                                           |
| Approval behavior                        | `docs/architecture/approval-workflow.md`                                                         |
| Development security                     | `docs/development/security.md`                                                                   |
| Production/deployment                    | `docs/deployment/README.md` and the applicable runbook                                           |

If implementation and documentation disagree, stop and reconcile them in the same change. The
current user/task defines scope; documentation supplies constraints and context.

## Repository-Wide Instructions

### Working safely

- Inspect `git status` before editing and preserve unrelated work.
- Prefer the smallest complete vertical change over broad scaffolding.
- Do not perform destructive data, filesystem, Git, deployment, or external-service actions unless
  explicitly authorized and safely scoped.
- Record assumptions that materially affect behavior. Ask for direction instead of inventing a
  product, legal, billing, security, or migration decision.

### Architecture and domain

- Respect the service boundaries in [`contributing.md`](contributing.md).
- Scope every customer-owned record, query, mutation, job, cache key, file, export, and device
  operation to an organization. Prove that client-supplied IDs belong to the active tenant.
- Keep `Person`, `UserAccount`, `OrganizationMembership`, and `Employment` as separate lifecycles.
- Preserve assignments, reporting lines, roles, schedules, policies, and employment history with
  effective dates.
- Treat raw scans as immutable evidence and approved corrections as separate auditable records.
- Enforce capability, resource scope, release flag, and subscription entitlement on the server.
  Navigation visibility and role display names are not enforcement.
- Prevent self-approval and preserve immutable approval decisions.
- Make scans, imports, accruals, notifications, exports, jobs, and billing events idempotent.
- Store instants in UTC, render in the effective timezone, and keep calendar dates distinct.

### Architecture decisions

- Read and follow [`../architecture/decisions/README.md`](../architecture/decisions/README.md).
- Add or supersede an ADR when work changes a service boundary, tenant model, authorization model,
  persistence strategy, public/device protocol, background-job guarantee, file/storage approach,
  external integration contract, billing/entitlement model, deployment topology, or another
  expensive-to-reverse technical direction.
- Do not bury a decision only in code, chat, an issue, or a pull request description.
- A PR must identify its ADR or explain why the work is not architectural.

### Implementation

- Use pnpm and established repository scripts.
- Reuse current patterns and dependencies. Justify new production dependencies.
- Keep TypeScript strict; avoid `any`, unchecked casts, and duplicated persistence types.
- Validate JSON and untrusted input at boundaries with existing schema patterns.
- Keep UI, domain, persistence, authorization, and external effects separable and testable.
- Do not weaken lint, coverage, security, authorization, validation, or tests.
- Do not leave fake production behavior, silent placeholders, or untracked TODOs. Gate and document
  intentionally incomplete work.
- Follow [`testing.md`](testing.md) and report commands actually run. Never invent successful test
  results or hide skipped, blocked, flaky, or failed checks.

### Completion

Before declaring completion, verify that:

- acceptance criteria are met without unrelated scope;
- tenancy, authorization, entitlements, validation, audit, idempotency, timezones, and failure
  recovery were considered;
- tests cover applicable success, boundary, failure, replay, and isolation behavior;
- migration and forward-fix implications were reviewed;
- affected documentation and ADRs were updated; and
- the handoff states changed behavior, verification evidence, limitations, and rollout needs.

## Portal

- The portal owns human-facing workflows, not hardware-facing device endpoints.
- Keep `page.tsx` thin. Put mutations in `actions.ts`, reads in `queries.ts`, feature access in
  `permissions.ts`, UI contracts in `types.ts`, pure logic in `_lib`, and feature UI in
  `_components`.
- Use kebab-case filenames, keep feature code local until a second consumer exists, and respect
  enforced component/function size limits.
- Authenticate, authorize, validate organization and resource scope, and enforce entitlements
  before protected reads or writes.
- Server actions perform validated atomic mutations, required audits, and deliberate
  revalidation/redirects.
- Map persistence results to page-facing types; components should not depend on Prisma details.
- Cover loading, empty, validation, authorization, failure, success, responsive, keyboard, focus,
  label, and readable-error behavior.

## Device Gateway

- Accept authenticated device traffic only.
- Preserve raw request bytes for signatures. Authenticate first and require the payload device ID
  to match the authenticated device.
- Scope devices, enrollments, fingerprint mappings, and scans to the device organization/location.
- Preserve immutable scan evidence and idempotent scan/enrollment replay behavior.
- Validate payloads with shared schemas and return stable safe errors without internal details.
- Coordinate protocol changes across documentation, shared schemas, gateway tests, firmware
  compatibility, and rollout/version behavior.

## Worker

- Own asynchronous and scheduled work; do not hide business jobs inside an untracked cron callback.
- Every job carries tenant context, is idempotent, and uses an atomic claim/lock where concurrent
  execution is unsafe.
- Define retry/backoff, terminal failure, operator recovery, job-run visibility, and redaction.
- Use stable idempotency keys for messages, exports, billing, and accrual transactions.
- Make reruns and catch-up processing safe and evaluate time rules in the effective timezone.

## Firmware

- Fingerprint templates remain inside the scanner.
- Never log or commit Wi-Fi credentials, device secrets, signatures, or production identifiers.
- Sign the canonical request exactly and preserve compatible timestamps.
- Queue offline scans with stable sequence identities and retry without changing idempotency keys.
- Honor enrollment session identity, expiry, cancellation, and replay-safe result reporting.
- Coordinate protocol compatibility with the gateway and avoid unnecessary main-loop blocking.
- Report device verification as skipped unless it was performed on actual hardware.

## Database Package

- Follow [`database-changes.md`](database-changes.md) completely.
- Add explicit organization ownership to tenant data and enforce organization consistency through
  constraints and transactional checks.
- Prefer database constraints and indexes for invariants PostgreSQL can express.
- Use singular PascalCase model/enum names, camelCase fields, descriptive relations, `@db.Date` for
  calendar dates, and `DateTime` for instants.
- Use `Restrict` for retained history, `Cascade` for true owned children, and `SetNull` where
  evidence must survive an optional actor.
- Treat JSON as a versioned validated contract, not an alternative to stable relational design.
- Never use `prisma db push`, modify an applied migration, or use seeds for production backfills.
- Keep development seed repeatable, E2E seed deterministic, and cleanup production-disabled.
