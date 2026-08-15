# Two-Month Workforce Platform Roadmap

## Roadmap Window and Goal

**Window:** August 17, 2026 through October 16, 2026.

**Goal:** turn the current attendance-oriented application into a secure, configurable,
subscription-ready workforce platform that can onboard paying pilot customers from Pakistan-based
offices with 5-20 desk-based employees.

The release should be broad enough to operate a small office, but it is not a claim that every HR,
payroll, legal, or industry workflow is complete. The architecture remains extensible while the
initial commercial scope centers on workforce records, attendance, leave, approvals,
communications, reporting, feature entitlements, and subscriptions.

The detailed product contract is in [`feature-catalog.md`](feature-catalog.md).

## Delivery Model

AI-assisted implementation is used to compress coding, refactoring, test generation,
documentation, and repetitive migration work. Human review remains responsible for correctness,
security, data migration safety, product decisions, and release approval.

A generated implementation is not complete until its tenant isolation, authorization,
entitlements, error handling, audit behavior, tests, documentation, and operational recovery have
been verified. Work runs in parallel across these streams:

- **Platform:** tenancy, authorization, flags, subscriptions, jobs, audit, and operations.
- **Workforce:** organization setup, employee lifecycle, attendance, leave, devices, and workflows.
- **Experience and release:** onboarding, reporting, communication, integration, E2E validation,
  accessibility, security, and pilot readiness.

## Release Outcome

By October 16, a customer should be able to:

1. create an organization and configure timezone, work week, structure, roles, locations, reusable
   shifts, and leave policies;
2. invite or import employees and manage hire, assignment, manager, transfer, suspension,
   termination, and account access;
3. enable subscribed modules and enforce plan limits without a deployment;
4. record desk attendance through a responsive web clock and optionally provision fingerprint
   devices;
5. review attendance, resolve exceptions, submit corrections, request leave, and complete scoped
   approval workflows;
6. receive in-app/email notifications and publish targeted announcements;
7. view operational dashboards and generate controlled employee, attendance, leave, and
   payroll-ready exports;
8. start and manage a trial/subscription, view usage, and survive payment failure without data
   deletion; and
9. receive support through observable, backed-up, audited production operations.

Recruitment and performance remain beta modules behind flags. Native mobile applications,
country-specific payroll calculation, and enterprise identity integrations are not part of this
release.

## Success and Release Gates

- Automated adversarial tests cover cross-tenant reads, writes, approvals, downloads, jobs,
  devices, and exports in every enabled module.
- Critical employee, manager, administrator, attendance, leave, and billing journeys pass E2E in
  a production-like environment.
- Accepted device/web events appear in the correct attendance timeline within two minutes during
  normal operation.
- Approval, worker, billing webhook, import, and scan processing is idempotent and recoverable.
- Subscription and organization overrides change effective entitlements without deployment.
- A backup restore and a forward migration rehearsal meet the agreed recovery objectives.
- No open critical/high tenant-isolation, authorization, billing, security, or data-loss defect
  remains.
- At least one design partner completes setup and a representative week of daily operations
  without direct database repair.

## Weekly Timeline

| Period                     | Theme                                               | Trackable weekly outcome                                                                                                                       |
| -------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Week 1 — Aug 17-23         | Decisions, inventory, and safety baseline           | Product scope is frozen for the release; tenant ownership and authorization gaps are enumerated; ADRs, CI, and two-tenant test fixtures exist. |
| Week 2 — Aug 24-30         | Tenant isolation and scoped access                  | Existing customer data and routes are organization-owned; resource scopes are enforced; cross-tenant adversarial tests pass.                   |
| Week 3 — Aug 31-Sep 6      | Organization onboarding and feature control         | A clean tenant can onboard, invite/import employees, configure structure/roles, and receive server-enforced flags and entitlements.            |
| Week 4 — Sep 7-13          | Employee lifecycle and desk attendance              | Employee lifecycle, reusable shifts, web clock, attendance policies, exception views, and corrections operate end to end.                      |
| Week 5 — Sep 14-20         | Leave, approvals, devices, jobs, and notifications  | Leave ledger/accrual, reusable approvals, device console/enrollment, durable jobs, and notifications complete daily operations.                |
| Week 6 — Sep 21-27         | Subscriptions, usage, exports, and pilot operations | Trial/billing lifecycle, limits, audit viewer, exports, monitoring, backups, and support tools are pilot-ready.                                |
| Week 7 — Sep 28-Oct 4      | Reporting, communication, and beta modules          | Dashboards and targeted announcements are complete; recruitment/performance are tenant-safe, versioned, and released only as accepted betas.   |
| Week 8 — Oct 5-11          | System hardening and release candidate              | Full E2E, security, accessibility, performance, migration, restore, and incident exercises pass against a release candidate.                   |
| Release window — Oct 12-16 | Pilot validation and go/no-go                       | Pilot data is onboarded, critical feedback is resolved, commercial/support documents match behavior, and the launch gate is signed off.        |

## Week 1 — August 17-23: Decisions, Inventory, and Safety Baseline

### Goals

- Validate the Pakistan 5-20-person desk-office profile with prospective users and nominate at
  least one design partner.
- Freeze general-availability, beta, and deferred scope for this release.
- Decide English-only versus bilingual launch, web clock behavior, fingerprint add-on role,
  packaging hypothesis, and professional review needed for Pakistan-specific legal/tax claims.
- Write ADRs for tenant isolation, scoped authorization, flags versus entitlements, background
  jobs, file storage, transactional email, billing, and observability.
- Create a tenant-ownership matrix for every database model and an access inventory for every
  query, action, route, download, job, and export.
- Add a second organization to deterministic fixtures and build the first cross-tenant tests.
- Make lint, typecheck, tests, build, formatting, schema validation, and critical E2E checks
  deterministic in CI.
- Establish a production-like staging environment with migration and rollback-forward practice.

### Done when

- Every release feature has acceptance criteria, owner, dependencies, test plan, and flag.
- Known unscoped models and routes have migration tasks; new unscoped customer data is blocked.
- The full verification pipeline finishes consistently and produces actionable failures.

## Week 2 — August 24-30: Tenant Isolation and Scoped Authorization

### Goals

- Add organization ownership and safe backfills for devices, shifts, holidays, company settings,
  leave configuration, recruitment, announcements, performance, audit, jobs, and reports.
- Introduce tenant-scoped data-access and policy helpers and require organization context for
  customer-facing operations.
- Carry scope metadata into the active access context and enforce `SELF`, direct-report,
  organization-unit-tree, and organization scopes.
- Replace authorization based only on role display names and close unsafe ID-based mutation and
  download paths.
- Add tenant-aware audit primitives, request correlation, safe error responses, secure headers,
  login/device rate limits, and secret/dependency scanning.
- Test every existing module with two tenants, including device requests and background work.

### Done when

- Two organizations can use every enabled existing module without observing or changing each
  other's records.
- Resource scope tests cover employee, manager, HR, and organization-administrator access.
- Gateway and portal errors do not expose internal exception details or sensitive values.

## Week 3 — August 31-September 6: Onboarding, Identity, and Feature Control

### Goals

- Build guided organization setup for locale, timezone, work week, locations, units, positions,
  reporting lines, reusable shifts, leave defaults, and initial roles.
- Add invitations, password setup/reset, email verification, organization switching, session
  listing/revocation, and secure offboarding.
- Add admin experiences for organization structure, custom roles, scoped assignments, policies,
  and feature configuration.
- Deliver validated CSV employee import with dry run, row errors, idempotent retry, and audit.
- Implement stable feature definitions, release flags, plan entitlements, limits, expiring
  organization overrides, and one authoritative server evaluation service.
- Add activation analytics without capturing unnecessary personal data.

### Done when

- A clean organization reaches first employee login without seed data or database access.
- A direct server call cannot bypass a disabled flag, missing entitlement, limit, or resource
  permission.
- Import retry does not duplicate people, memberships, or employment records.

## Week 4 — September 7-13: Employee Lifecycle and Desk Attendance

### Goals

- Complete invite, hire, edit, transfer, promotion, manager/location/shift change, suspend,
  terminate, rehire, and account-access workflows with effective-dated history.
- Replace per-employee shift creation with reusable schedules and effective assignments.
- Launch a responsive authorized web clock and record immutable source metadata.
- Make attendance policy configurable for grace, rounding, missing punches, overnight shifts,
  breaks, late/early rules, holidays, minimum hours, and overtime.
- Complete employee, team, and company attendance views, exception queues, corrections, and an
  explainable timeline.
- Add timesheet periods with manager review and lock/reopen controls if the core flows remain on
  schedule; otherwise keep timesheets flagged for beta.

### Done when

- Employment changes preserve history and revoke access at the configured time.
- Attendance calculations explain which events, schedule, policy version, holiday, and correction
  produced the result.
- Web clock replay or double submission cannot create duplicate attendance evidence.

## Week 5 — September 14-20: Leave, Workflow, Devices, and Background Work

### Goals

- Make tenant-owned leave policies configurable for eligibility, accrual, proration,
  carry-forward, caps, half days, negative balance, evidence, and cancellation.
- Add a balance transaction ledger plus idempotent accrual and rollover jobs.
- Extract versioned approval workflows supporting manager, role, named approver, fallback,
  delegation, no-self-approval, reminders, escalation, and immutable decisions.
- Add a device console for provisioning, location assignment, secret rotation, health, firmware,
  enrollment start/cancel/status, template revocation, and diagnostics.
- Replace the placeholder worker with durable tenant-scoped jobs, locking, retries, backoff,
  dead-letter visibility, and job-run records.
- Deliver in-app notifications and transactional email with preferences, deduplication, retries,
  and delivery state.

### Done when

- Re-running an accrual, scan, approval, enrollment result, or notification does not duplicate the
  outcome.
- A representative office completes a simulated week of attendance, corrections, leave,
  approvals, holidays, devices, and messages without database repair.

## Week 6 — September 21-27: Commercial SaaS and Pilot Operations

### Goals

- Validate affordable PKR-ready packaging and limits. Keep feature keys independent from marketing
  plan names.
- Implement trial, checkout/manual invoice path as selected, subscription changes, grace,
  past-due, cancellation, reactivation, invoice links, and billing identity.
- Process signed billing webhooks through an idempotent event ledger and add provider
  reconciliation.
- Meter active workers, devices, storage, exports, and API usage with visible warnings and defined
  soft/hard limit behavior.
- Add organization billing/usage UI and an operator console with audited support access and
  expiring overrides.
- Deliver asynchronous employee, attendance, leave, and payroll-ready exports with permission
  checks, expiry, and download audit.
- Add operational dashboards/alerts, encrypted backup automation, and the first measured restore
  drill.

### Done when

- Trial, upgrade, downgrade, payment failure, grace, cancellation, and reactivation produce the
  expected entitlements without deleting customer data.
- Support can diagnose job, device, email, export, and billing failures without a database shell.
- Backup restore meets the initial documented RPO and RTO.

## Week 7 — September 28-October 4: Reporting, Communication, and Betas

### Goals

- Define headcount, attendance, leave, recruitment, and performance metrics in a data dictionary
  and deliver scoped dashboards with drill-down.
- Complete tenant-owned announcements with audience targeting, schedule/expiry,
  acknowledgement, and read reporting.
- Harden recruitment tenant ownership, candidate files, stages, interviews, scorecards, and
  candidate-to-employee conversion; keep it behind a beta flag.
- Version performance templates and deliver a basic review cycle with reminders, submission,
  acknowledgement, and completion state; keep it behind a beta flag.
- Move new candidate/employee documents to secure object storage with file validation, signed
  access, retention, and download audit.
- Add provider-backed email and calendar invitations needed by enabled workflows.

### Done when

- Pilot users can reconcile dashboards and exports to source records.
- Historical reviews render against their original template version.
- Disabled beta modules expose neither navigation nor callable server operations.

## Week 8 — October 5-11: Release Candidate Hardening

### Goals

- Freeze feature development and resolve only release-blocking defects.
- Run the full unit, integration, E2E, tenant-isolation, migration, and clean-install suite.
- Review authentication/session security, privileged-user MFA, files, billing, device protocol,
  dependencies, and tenant authorization.
- Audit critical flows for responsive behavior, keyboard use, focus/errors, contrast, semantic
  structure, and screen-reader labels.
- Load and soak test login, dashboards, web/device scan bursts, approvals, jobs, exports, and
  billing webhooks with realistic small-office traffic plus safety margin.
- Run restore, migration/forward-fix, incident, tenant export, and controlled deletion exercises.
- Finish administrator setup, employee help, data import, device installation, support, incident,
  and customer offboarding documentation.

### Done when

- The release candidate meets every success gate with no unresolved critical/high defect.
- Monitoring ownership and escalation exist for each service, queue/job, integration, and backup.
- Product, pricing, privacy, support, and availability statements match implemented behavior.

## Release Window — October 12-16: Pilot and Go/No-Go

- Onboard real pilot data through supported import/setup flows.
- Observe complete daily attendance, leave, approval, notification, reporting, and subscription
  operations.
- Fix only launch-blocking issues and repeat affected safety/regression checks.
- Record pilot acceptance, known limitations, flagged betas, support boundaries, and deferred work.
- Approve or reject launch using the documented gates; do not convert an unmet safety gate into an
  undocumented exception.

## Scope Control

### Required for release

- multi-tenancy, organization context, secure authentication, scoped RBAC, audit, release flags,
  and entitlements;
- guided setup, employee lifecycle, structure, roles, CSV import, and self-service;
- responsive web attendance, reusable shifts, policies, corrections, leave, approvals,
  notifications, work calendar, and device operations;
- subscriptions, usage visibility, exports, operational monitoring, backups, and support tooling;
- announcements and core operational dashboards.

### Beta behind flags

- recruitment and candidate-to-employee conversion;
- performance review cycles;
- timesheet approval, advanced attendance policies, and optional integration endpoints if they do
  not meet release gates by Week 8.

### Deferred

- native mobile apps and field-worker location tracking;
- country-specific payroll/tax calculation;
- benefits, compensation, expenses, assets, learning, and workforce planning;
- SSO/SCIM, public integration marketplace, and jurisdiction-specific compliance packs.

## Roadmap Change Process

Review goals at the end of every week. A change must record customer evidence, safety impact,
displaced scope, owner, and updated acceptance criteria. If required work slips, remove or flag a
beta feature before weakening tenant isolation, authorization, billing correctness, migration
safety, backups, or critical workflow tests.
