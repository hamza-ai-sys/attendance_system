# Workforce Platform Project Governance

The repository's canonical AI instructions are in `AGENTS.md` files.

Before planning or editing:

1. Read the root `AGENTS.md` completely.
2. Read each additional `AGENTS.md` between the repository root and every file being changed.
3. Read the task-specific documentation required by those instructions.
4. Inspect the working tree and preserve unrelated changes.

Treat the resulting instruction chain as mandatory for planning, implementation, review, and
verification. If instructions conflict, the nearest directory rule is more specific, but no rule
may weaken tenant isolation, authorization, data integrity, security, or verification.

Do not declare work complete until applicable checks have run successfully. Never invent test
results, hide failures, weaken checks, bypass server authorization/entitlements, create unscoped
tenant data, or alter applied migrations. Report blockers and skipped checks explicitly.
