# Portal Development Guidelines

Portal routes should be organized as small, feature-local modules. The route file coordinates
authentication, authorization, data loading, and rendering; it should not contain the detailed UI
or business logic for the feature.

## Recommended Layout

```text
apps/portal/src/app/<route>/
├── page.tsx
├── actions.ts
├── permissions.ts
├── queries.ts
├── types.ts
├── _components/
│   ├── <feature>-header.tsx
│   ├── <feature>-table.tsx
│   └── <feature>-form.tsx
└── _lib/
    ├── filters.ts
    ├── metrics.ts
    └── validation.ts
```

Only create files and folders that the module needs. A read-only page may have no `actions.ts`,
and a simple module may not need `_lib`. Nested routes, such as `new` or `[id]`, are separate route
modules and may have their own `_components` and `_lib` folders.

## Responsibilities

- `page.tsx` is a thin server component. It obtains the current user, enforces route access, loads
  page data through queries, and composes feature components.
- `actions.ts` contains server actions and mutations. It validates input, checks authorization,
  performs the mutation, and revalidates or redirects as needed.
- `queries.ts` contains database reads and maps persistence records into page-facing data. React
  components should not know Prisma query details.
- `permissions.ts` contains feature-specific authorization predicates. Generic role and permission
  primitives remain in the portal's shared RBAC library.
- `types.ts` contains types owned by the feature. Do not export UI state or feature contracts from
  `actions.ts` merely because an action uses them.
- `_components/` contains feature-local React components. The underscore keeps implementation
  folders from being mistaken for routes in the App Router.
- `_lib/` contains pure feature logic such as filters, metrics, date calculations, mapping, and
  validation. Prefer descriptive filenames over a general `utils.ts`.

Code used by one route module stays with that module. Move code to `app/_components`, `app/_lib`,
or a shared package only when it is genuinely used across feature modules or applications.

## Page And Access Pattern

Use the shared session guard instead of duplicating an unauthenticated-user check on every page.
Check authorization before loading protected data. If a signed-in user should not enter a route,
redirect them to the most useful permitted page; do not render a duplicated 403 page unless the
product explicitly requires one.

```tsx
export default async function FeaturePage() {
  const user = await requireCurrentUser();
  if (!canManageFeature(user)) redirect("/feature");

  const data = await getFeaturePageData(user.employeeId);
  return <FeatureView data={data} />;
}
```

Route names should describe the user's destination and perspective. Use `my-*` for employee-owned
views and `employee-*` for management/review views. Keep separate workflows on separate routes
instead of switching between unrelated employee and reviewer experiences inside one page.

## Component And Function Boundaries

Extract components by responsibility rather than moving arbitrary line ranges. Useful boundaries
include headers, filters, metric cards, tables, rows, forms, modal bodies, and empty states. A
component should receive display-ready data and expose events; query and policy details belong
outside it.

ESLint enforces these portal limits:

- React/TSX module: at most 250 effective lines.
- Named React component: at most 100 effective lines.
- Other function: at most 50 effective lines.

Blank and comment-only lines do not count. Treat the limits as an upper bound, not a target. Do not
disable the rules to avoid a reasonable extraction.

## Naming And Imports

- Use kebab-case filenames for all TypeScript modules and components. ESLint enforces this rule;
  PascalCase is reserved for component and type symbols, not filenames.
- Name components and functions after their responsibility, such as `EmployeeDirectoryTable` or
  `getAttendanceMetrics`.
- Use `import type` for type-only imports.
- Import feature code from its owning module; avoid reaching through another feature's action file
  for a type.
- Keep pure functions independent of React and the database so they can be tested directly.

## Validation

After changing a portal module, run its focused lint/tests during development and the complete
checks before opening a pull request:

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

Tests should cover extracted filters, metrics, mapping, and permission decisions as pure logic.
Server actions and queries should retain integration coverage where behavior depends on the
database or Next.js routing.
