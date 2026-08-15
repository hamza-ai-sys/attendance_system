# Portal Instructions

## Required context

- Read `docs/architecture/portal-module-structure.md` before modifying portal modules.
- Read the applicable workflow/domain documentation and the root `AGENTS.md` requirements.

## Boundaries and structure

- The portal is the human-facing full-stack application. Do not add hardware-facing endpoints here.
- Keep `page.tsx` thin: require the session, enforce access, load page data through queries, and
  compose components.
- Keep mutations in `actions.ts`, reads in `queries.ts`, feature authorization in `permissions.ts`,
  UI contracts in `types.ts`, pure logic in `_lib`, and feature UI in `_components`.
- Keep feature-local code local until it has a real second consumer. Use kebab-case filenames.
- Respect ESLint size limits; extract cohesive responsibilities instead of disabling rules.

## Access and data

- Use the shared session guard and current organization context. Check authorization and
  entitlements before protected queries and mutations.
- Scope every customer-data query and mutation to `user.organizationId`; also validate the target
  resource scope. A record ID alone is never sufficient.
- Server actions must authenticate, authorize, validate form input, perform an atomic mutation,
  create required audit records, and revalidate/redirect deliberately.
- Do not rely on navigation visibility, role display names, client components, or form options for
  enforcement.
- Map Prisma results into page-facing types. React components must not depend on persistence
  implementation details.

## UI and testing

- Provide loading/pending, empty, validation, authorization, failure, and success behavior.
- Preserve keyboard access, labels, focus behavior, responsive layouts, and readable errors.
- Test pure filters, calculations, mapping, and permission decisions directly. Add integration/E2E
  coverage for database, session, tenant, entitlement, and routing behavior.
- Run focused portal tests plus root verification. Run `pnpm test:e2e` for critical user journeys.
