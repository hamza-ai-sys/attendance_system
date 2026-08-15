# Architecture Decision Records

Architecture Decision Records (ADRs) preserve significant technical decisions, their context, and
their consequences. They prevent important reasoning from existing only in code review, chat, or
the memory of one contributor.

## When an ADR is Required

Add or supersede an ADR when a change introduces or materially changes an expensive-to-reverse
direction, including:

- application/service or package boundaries;
- tenant ownership, isolation, or organization context;
- identity, authentication, authorization, permission scope, or entitlement architecture;
- database/domain ownership, history strategy, or cross-domain persistence rules;
- public, internal, device, webhook, or file-storage contracts;
- background processing, idempotency, delivery, or consistency guarantees;
- billing, subscription, metering, or feature-flag architecture;
- deployment topology, infrastructure provider, availability, backup, or recovery strategy;
- sensitive-data, encryption, retention, or audit strategy; or
- adoption/replacement of a foundational framework or production dependency.

An ADR is normally unnecessary for a local implementation detail, bug fix that restores documented
behavior, routine dependency patch, UI copy/layout change, or a feature built entirely within an
already accepted architecture.

If uncertain, write the ADR. A short explicit decision is cheaper than reconstructing missing
reasoning later.

## Workflow

1. Copy [`template.md`](template.md) to the next four-digit sequence and a descriptive kebab-case
   name, for example `0002-tenant-isolation-strategy.md`.
2. Set the status to `Proposed` while alternatives are under review.
3. Describe the problem and constraints in **Context**, the chosen direction in **Decision**,
   rejected meaningful alternatives in **Alternatives**, and tradeoffs in **Consequences**.
4. Add the record to the index below and link it from affected architecture/product documentation.
5. Merge the ADR with, or before, the implementation that depends on it.
6. Change the status to `Accepted` when approved. Never rewrite an accepted decision to pretend the
   past was different; create a new ADR that `Supersedes` it and mark the old record `Superseded`.

Allowed statuses are `Proposed`, `Accepted`, `Deprecated`, and `Superseded`.

## Enforcement

- `pnpm docs:check` validates ADR filenames, sequence uniqueness, required sections, allowed status,
  and index registration.
- The pull request template requires an ADR link or an explanation of why the change is not
  architectural.
- AI instructions require ADR evaluation before architectural implementation.
- Reviewers and branch protection remain responsible for the semantic question of whether a change
  actually introduces an architectural decision. CI cannot infer that reliably from a diff.

## Index

| ADR                                 | Status   | Decision                                                                                   |
| ----------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| [0001](0001-monorepo-boundaries.md) | Accepted | Separate portal, device gateway, worker, firmware, and shared packages in a pnpm monorepo. |
