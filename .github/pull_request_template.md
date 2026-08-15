## Summary

## Scope and acceptance criteria

- Roadmap week / feature key / issue:
- User-visible outcome:
- Explicitly out of scope:

## Safety review

- [ ] I read the applicable root and nested `AGENTS.md` files and required documentation
- [ ] I reviewed all AI-generated code and tests for correctness
- [ ] Tenant ownership and cross-tenant ID handling are correct or not applicable
- [ ] Server authorization and resource scope are correct or not applicable
- [ ] Release flags and subscription entitlements are enforced server-side or not applicable
- [ ] Validation, audit, idempotency, timezones, and failure/retry behavior are covered or not applicable
- [ ] No secrets, personal data, biometric data, internal errors, or production payloads are exposed

## Verification

- [ ] Focused tests added/updated and passing
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm format:check`
- [ ] `pnpm e2e` (if a critical user workflow changed)
- [ ] `pnpm firmware:build` (if firmware changed)

Record commands actually run, results, and any skipped/blocked check with its reason:

## Data, documentation, and rollout

- [ ] Migration reviewed and existing-data/clean paths verified, or no migration needed
- [ ] Seeds and cleanup scripts updated, or not affected
- [ ] Architecture, feature, setup, security, and operations docs updated, or not affected
- [ ] Environment variables and secrets handling documented, or not affected
- [ ] Rollout flag, entitlement, backfill, compatibility, and forward-fix plan documented, or not needed

## Risks and evidence

- Risks / known limitations:
- Screenshots, logs, reports, or other review evidence:
