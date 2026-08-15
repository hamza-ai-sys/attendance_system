# Database Package Instructions

## Required context

- Read `docs/architecture/data-model.md` and `docs/development/database-changes.md` completely before
  changing this package.

## Modeling

- Keep `Person`, `UserAccount`, `OrganizationMembership`, and `Employment` separate.
- Add explicit `organizationId` ownership to tenant data and enforce organization consistency in
  schema constraints and transactional application checks.
- Use effective-dated records for changing assignments, reporting lines, roles, policies, and
  schedules. Preserve operational history.
- Prefer database constraints and indexes for invariants PostgreSQL can express; also validate
  cross-row and temporal rules transactionally.
- Use singular PascalCase model/enum names, camelCase fields, descriptive relation names, `@db.Date`
  for calendar dates, and `DateTime` for instants.
- Use `Restrict` for retained business history, `Cascade` only for true owned children, and
  `SetNull` when evidence must survive an optional actor/match.
- Treat JSON as a versioned validated contract, not an escape hatch from stable relational design.

## Migrations and data scripts

- Never use `prisma db push`, modify an applied migration, or use seed data for required production
  backfills.
- Use expand-migrate-contract for destructive or zero-downtime changes. Review generated SQL for
  drops, rewrites, locks, enum behavior, backfill ordering, indexes, and mixed-version compatibility.
- Keep development seed repeatable, E2E seed deterministic, and clear-development safe and
  production-disabled. Review all three when schema relations change.
- Verify an existing-data upgrade and a clean migration path. Update data-model documentation in
  the same change.

## Verification

Run the database-specific commands plus applicable root checks:

```bash
pnpm --filter @attendance/db exec prisma validate
pnpm db:generate
```
