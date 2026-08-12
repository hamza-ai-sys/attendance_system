# Database Change Guide

Use this workflow for every Prisma model, PostgreSQL migration, database-backed enum, relation,
index, constraint, or seed-data change. The goal is for a reviewer to understand both the final
shape of the data and the safe path from an existing database to that shape.

## Before Editing

1. Read [`docs/architecture/data-model.md`](../architecture/data-model.md) and the affected Prisma
   models.
2. Identify the owning domain and lifecycle. Decide whether the value belongs to a `Person`,
   `UserAccount`, `OrganizationMembership`, `Employment`, or a feature-owned model.
3. Search all readers and writers of the affected models, including dashboard queries/actions,
   device gateway routes, worker jobs, tests, and seed scripts.
4. Classify the change:
   - **Additive:** nullable column, table, or compatible index.
   - **Data-changing:** backfill, type conversion, rename, or relationship migration.
   - **Contracting/destructive:** dropping data, making a column required, removing an enum value,
     or changing a foreign-key/delete policy.
5. For a new domain boundary or a decision with long-term alternatives, add an architecture
   decision record under `docs/architecture/decisions/` (create the directory when the first ADR
   is needed). Smaller changes belong directly in the data-model document.

## Implementing The Change

### 1. Update The Schema

Edit `packages/db/prisma/schema.prisma`.

- Use singular PascalCase model and enum names and camelCase field names.
- Give relations descriptive names when a pair of models has multiple relationships.
- Add indexes for actual lookup, ordering, foreign-key, and effective-date query patterns.
- Choose `onDelete` deliberately. Use `Restrict` for retained business history, `Cascade` only for
  true owned children, and `SetNull` when the child is evidence that must survive.
- Prefer explicit status and validity fields over deletion for historical records.
- Prefer `employmentId` for a new reference to `Employment`. Existing `employeeId` fields are
  legacy names and also reference `Employment`.
- Use `@db.Date` for calendar dates. Use `DateTime` for instants and document timezone behavior.
- Treat JSON as a versioned application contract: define and validate its shape in the owning
  feature instead of using it to avoid modeling stable relational data.

Run schema validation and regenerate the client:

```bash
pnpm --filter @attendance/db exec prisma validate
pnpm db:generate
```

### 2. Create And Review A Migration

For a straightforward local change, run:

```bash
pnpm db:migrate
```

Give the migration a short, descriptive snake-case name when Prisma prompts. For a rename,
backfill, custom constraint, or any operation where generated SQL needs adjustment, generate the
migration without applying it first:

```bash
pnpm --filter @attendance/db exec prisma migrate dev --create-only --name your_change_name
```

Review every line of the generated `migration.sql` before applying it. Prisma can interpret a
rename as a drop and add; replace that with data-preserving SQL when necessary.

Check the migration for:

- accidental table/column drops or data truncation;
- correct backfill ordering before `NOT NULL` or unique constraints are added;
- enum changes that PostgreSQL cannot safely reverse;
- lock duration and full-table rewrites on large tables;
- foreign-key organization/tenant consistency and referential actions;
- indexes supporting the new reads without duplicating existing indexes; and
- application compatibility while old and new service versions may run together.

Never use `prisma db push` for a shared schema. Never edit, rename, reorder, or delete an applied
migration. Correct it with a new forward migration.

### 3. Use Expand, Migrate, Contract For Risky Changes

Do not deploy a destructive change in one step when running code may still use the old shape.

1. **Expand:** add the new nullable column/table and make the application compatible with both
   shapes.
2. **Migrate:** backfill existing rows in a committed migration or controlled production job.
   Required data corrections belong here, not in a development seed.
3. **Contract:** switch all reads/writes, verify the backfill, then remove the old shape in a later
   release.

A rollback plan should normally be a safe forward fix. Do not assume a production migration can
be rolled back after data has been transformed or old columns have been removed.

### 4. Update All Consumers

Update affected:

- Prisma selects/includes and transactions;
- dashboard actions, queries, authorization, forms, and displayed labels;
- device gateway and worker logic;
- shared validation schemas and TypeScript types;
- unit, integration, and E2E tests; and
- audit logging or report exports that expose the changed data.

For organization-owned data, verify every read and write is constrained to the active
organization. For effective-dated data, verify reads use the agreed half-open interval and writes
close prior rows atomically.

### 5. Update Data Scripts

Review all three scripts even when only one needs an edit:

- `packages/db/scripts/seed-development.ts`
- `packages/db/scripts/seed-e2e.ts`
- `packages/db/scripts/clear-development.ts`

The development seed must remain repeatable and may update/delete only fixtures it clearly owns.
The E2E seed must remain minimal and deterministic. The clear script must delete child records
before parents while preserving the schema and migration table.

Each environment's seed is a complete entry point: development organization/access fixtures
belong in `seed-development.ts`, while E2E organization/access fixtures belong in `seed-e2e.ts`.
Do not add an environment-independent fixture seed that either script must invoke as a separate
step. Small infrastructure-only utilities may be shared when they contain no fixture catalog or
environment policy.

Seed data is not a deployment mechanism. Any row or backfill required in every environment must
be created by a migration or an explicitly managed production operation.

## Documentation Required In The Same Pull Request

Every database change must update documentation when it changes meaning, not merely generated
types.

Update [`docs/architecture/data-model.md`](../architecture/data-model.md) for any changed:

- model responsibility or field ownership;
- relationship, cardinality, or lifecycle;
- unique, foreign-key, temporal, or application-level invariant;
- authorization or tenant boundary;
- deletion/retention policy;
- date, time, JSON, binary, or enum semantics; or
- known limitation that future code must account for.

Update the relevant feature/protocol document when the database change alters a public workflow
or service contract. Add an ADR for a significant architectural choice and link it from the data
model. Documentation must describe the resulting design and the reason for it; the migration SQL
already describes the mechanics.

A pull request with a schema migration but no documentation change must explicitly state why the
existing documentation remains complete. "The schema is self-documenting" is not sufficient.

## Verification

Run the focused tests while developing, then run the repository checks:

```bash
pnpm --filter @attendance/db exec prisma validate
pnpm db:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
```

Also verify the data path, not only compilation:

1. Apply the migration to a database containing the previous schema and representative data.
2. Confirm preserved IDs, relations, counts, and critical values with targeted queries.
3. Run `pnpm db:seed` twice and confirm the second run succeeds without duplicating fixtures or
   deleting unrelated development data.
4. Run the E2E suite when a user-visible workflow, authorization query, or seed fixture changes:

   ```bash
   pnpm e2e
   ```

5. Test a clean migration path with the committed migrations before release. Do not use
   `pnpm db:clear` against a database whose local data needs to be preserved.

For production, take an appropriate backup, use `pnpm db:migrate:deploy`, monitor migration time
and application errors, and verify the backfill/invariants after deployment.

## Pull Request Checklist

Copy the relevant items into the pull request description:

```markdown
### Database change

- [ ] Schema and generated migration are included.
- [ ] Migration SQL was reviewed for data loss, locks, and rename behavior.
- [ ] Existing-data upgrade and clean-database paths were tested.
- [ ] Required backfills are in the migration/managed operation, not a dev seed.
- [ ] Foreign keys, indexes, uniqueness, tenant boundaries, and delete behavior were reviewed.
- [ ] Development seed, E2E seed, and clear script were reviewed/updated.
- [ ] All application readers, writers, types, and tests were updated.
- [ ] `docs/architecture/data-model.md` and affected feature docs were updated.
- [ ] Deployment compatibility and forward-recovery plan are described.
- [ ] Prisma validation, lint, typecheck, tests, build, and formatting checks pass.
```

In the pull request summary, state what changes for existing rows, whether downtime or a staged
rollout is required, and how a reviewer can verify the migrated result.
