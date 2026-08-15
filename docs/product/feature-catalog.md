# Workforce Platform Feature Catalog

## Product Direction

The product should become a configurable workforce operating system for office-based organizations.
"Any office" does not mean one fixed workflow that happens to contain many screens. It means a
common workforce core with configurable policies, permissions, workflows, localization, and
optional modules so different organizations can adopt the same platform without sharing data or
being forced into the same operating model.

The initial market profile is a Pakistan-based office with 5-20 desk-based employees that needs
employee records, attendance, leave, approvals, and basic people operations without a dedicated HR
systems team. Larger-company controls and specialized country or industry requirements should be
added through integrations and later modules.

## Initial Customer Profile

| Dimension             | Working decision                                      | Product implication                                                                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Primary country       | Pakistan                                              | Support PKR commercial presentation, Pakistan-friendly invoicing/payment operations, configurable local holidays, local date/time expectations, and payroll-ready exports. Validate legal and tax requirements before claiming compliance. |
| Organization size     | 5-20 people                                           | Setup must take minutes, common defaults should work immediately, and the product must not require a full-time HR administrator. Pricing needs an affordable base tier rather than enterprise-style implementation fees.                   |
| Work pattern          | Desk-based                                            | Responsive web clocking is a launch feature. Fingerprint hardware is an optional add-on rather than the only attendance path. Native mobile workforce tracking, route planning, and field geolocation are deferred.                        |
| Likely buyer/operator | Owner, office administrator, or part-time HR operator | Use plain language, guided setup, combined operational dashboards, safe defaults, and lightweight approvals. Preserve separation of duties without forcing many specialist roles.                                                          |

This profile is the launch wedge, not a permanent platform limitation. Tenant isolation,
effective-dated employment, scoped permissions, policy configuration, and modular entitlements
remain designed for larger and more varied organizations.

## Product Principles

1. Every business record belongs to an organization and is isolated by default.
2. Features are modular; a customer sees only what its subscription and configuration enable.
3. Policies are configured, not hard-coded by role name, country, or a five-day schedule.
4. Employee, manager, HR, owner, and platform-operator experiences are distinct.
5. Important changes are auditable and effective-dated rather than silently overwritten.
6. Web, device, import, API, and future mobile clients use the same authorization and domain rules.
7. Payroll is initially served through verified exports and integrations, not an inaccurate
   universal payroll calculator.
8. Accessibility, localization, privacy, and security are release requirements, not later polish.

## Status Legend

- **Working:** an end-to-end code path exists, but it may still need hardening for commercial use.
- **Partial:** useful implementation exists, but a required workflow, isolation rule, or operator
  experience is missing.
- **Model only:** database structures exist without a usable product workflow.
- **Not started:** no meaningful implementation was found.
- **Decision required:** product or architecture direction must be agreed before implementation.

## Current Product Baseline

| Area                           | Current status | Repository evidence and main gap                                                                                                                                                                                  |
| ------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity and login             | Partial        | Email/password sessions work. Invitations, account recovery, email verification, MFA, organization selection, and session management are absent.                                                                  |
| Organizations and employment   | Partial        | The identity, membership, employment, unit, position, reporting-line, and effective-dated assignment models exist. Admin management and lifecycle workflows are incomplete.                                       |
| Authorization                  | Partial        | Roles and permissions exist, but permission scopes are not centrally enforced and some navigation decisions still depend on hard-coded role names.                                                                |
| Employee directory and profile | Working        | Employee creation, listing, filters, and personal-record editing exist. Editing assignments, transfers, offboarding, documents, and bulk operations are missing.                                                  |
| Attendance                     | Partial        | Scan ingestion, attendance derivation, employee/team/company views, and correction requests exist. Tenant ownership, reusable policies, breaks, overtime, timesheets, and complete device operations are missing. |
| Fingerprint devices            | Partial        | Firmware, authenticated heartbeat, scan ingestion, and enrollment-result handling exist. There is no complete portal workflow to provision devices or create and monitor enrollments.                             |
| Leave                          | Partial        | Leave types, balances, employee requests, sequential approvals, and work-calendar inputs exist. Tenant isolation, scheduled accrual, notifications, policy variants, and robust cancellation are missing.         |
| Recruitment                    | Partial        | Job posts, configurable application steps, applications, CV storage, and interview fields exist. Records are not organization-owned and the candidate pipeline is not commercially complete.                      |
| Performance and notes          | Partial        | Templates, evaluations, and manager notes exist. Templates are mutable, tenant ownership is missing, and goals, cycles, calibration, and acknowledgements are absent.                                             |
| Announcements                  | Partial        | Creating and reading announcements works, but records are global and targeting, acknowledgement, scheduling, and delivery are absent.                                                                             |
| Notifications, audit, reports  | Model only     | Database models exist, but no end-user inbox, audit viewer, export pipeline, or background processing is implemented.                                                                                             |
| Background worker              | Not started    | The worker runs a cron placeholder only.                                                                                                                                                                          |
| Feature flags and entitlements | Not started    | No release-flag, plan-entitlement, or organization-override system exists.                                                                                                                                        |
| Subscriptions and billing      | Not started    | No plans, trials, subscriptions, usage limits, checkout, invoices, or billing webhooks exist.                                                                                                                     |
| SaaS operations                | Partial        | Docker/VPS deployment and a backup script exist. Observability, restore automation, support tooling, safe deployments, and SLOs are incomplete.                                                                   |

Several current models are platform-global rather than organization-owned: `Device`, `Shift`,
`Holiday`, `CompanySetting`, recruitment records, announcements, leave configuration, and
performance templates. This must be corrected before multiple paying customers use one deployment.

## Users and Roles

The product must support capabilities and scopes rather than assuming these exact titles:

| Persona                    | Primary outcomes                                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Employee                   | Maintain a profile, clock time, review attendance, request corrections and leave, read policies and announcements, complete assigned reviews. |
| Manager                    | See the correct team, approve requests, manage schedules, add notes, give feedback, and monitor exceptions.                                   |
| HR / people operations     | Manage the employee lifecycle, policies, leave, attendance exceptions, records, recruitment, and reporting.                                   |
| Organization administrator | Configure organization structure, access, integrations, subscription, security, and feature settings.                                         |
| Executive / owner          | View organization health and approve exceptional workflows without receiving unnecessary employee actions.                                    |
| Candidate                  | Browse public jobs, apply securely, upload documents, schedule interviews, and receive status communication.                                  |
| Platform operator          | Support tenants safely, monitor service health and billing, and use audited impersonation only when explicitly authorized.                    |

## Detailed Feature Catalog

### 1. SaaS Foundation

| Capability              | Detailed definition / completion criteria                                                                                                                                                                               | Current     | Initial release target       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------- |
| Tenant isolation        | Every tenant-owned row has `organizationId`; every read, write, cache key, job, export, file, and device request is scoped. Automated tests attempt cross-tenant access for every module.                               | Partial     | Required, Weeks 1-2          |
| Organization context    | A user with multiple memberships explicitly chooses and switches organizations; sessions carry the selected context and cannot silently select the first membership.                                                    | Not started | Required, Week 3             |
| Organization onboarding | A guided setup creates the organization, locale, timezone, week start, initial administrator, units, locations, roles, shifts, and policies. Progress can be resumed.                                                   | Not started | Required, Week 3             |
| Authentication          | Invitations, password setup/reset, email verification, secure session listing/revocation, rate limiting, and production cookie controls. MFA is required for privileged users before GA.                                | Partial     | Required, Weeks 3 and 8      |
| Scoped RBAC             | Stable permission keys plus `SELF`, direct-report, unit-tree, and organization scopes are enforced by reusable server-side policy functions. Custom roles and time-bounded assignments are supported.                   | Partial     | Required, Weeks 1-3          |
| Audit trail             | Login, access, configuration, approval, employee-data, billing, export, and support actions record actor, tenant, before/after state, request correlation, and timestamp. Authorized admins can search and export logs. | Model only  | Required, Weeks 2-6          |
| Release flags           | Engineering can disable or gradually roll out unfinished/risky behavior by environment, tenant cohort, or percentage without changing a customer's paid plan. Server evaluation is authoritative.                       | Not started | Required, Week 3             |
| Product entitlements    | Plans grant stable feature keys and limits. Organization overrides support trials, contractual exceptions, and support recovery with reason and expiry. APIs enforce access even if UI is hidden.                       | Not started | Required, Weeks 3-6          |
| Usage metering          | Idempotent usage events and aggregated counters enforce employee, device, storage, export, and API limits. Customers can see current usage before limits block work.                                                    | Not started | Required, Week 6             |
| Subscription lifecycle  | Trial, active, past-due, suspended, cancelled, and grace-period states are synchronized through idempotent billing-provider webhooks. Billing failure never deletes customer data.                                      | Not started | Required, Week 6             |
| Platform administration | Authorized operators can find tenants, view health and billing state, apply expiring overrides, and start audited support access. Destructive support actions require explicit confirmation.                            | Not started | Required, Week 6             |
| Localization            | Organization locale, timezone, week start, date/time format, working-day rules, and translatable UI strings. Store instants in UTC and calendar dates without timezone drift.                                           | Partial     | Required baseline, Weeks 3-8 |
| Data lifecycle          | Configurable retention, account export, tenant export, soft/end-dated operational records, and controlled tenant deletion with cooling-off and audit evidence.                                                          | Not started | Required baseline, Week 8    |

Release flags and subscription entitlements are separate concepts. Evaluation order should be:

```text
emergency kill switch
  -> environment/release rollout
    -> subscription entitlement and limit
      -> explicit organization override
        -> user/resource authorization
```

### 2. Workforce Core

| Capability                        | Detailed definition / completion criteria                                                                                                                                        | Current       | Initial release target       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------- |
| Employee directory                | Search, filters, pagination, configurable fields, active/inactive states, permitted contact details, and export. Sensitive fields have field-level authorization.                | Partial       | Required, Weeks 3-4          |
| Employee lifecycle                | Invite, hire, activate, transfer, promote, change manager/location/shift, suspend, terminate, rehire, and revoke access while preserving effective-dated history.                | Partial       | Required, Week 4             |
| Organization design               | Admin UI for legal entities where needed, business units, departments, teams, locations, cost centers, positions, reporting lines, and dotted-line managers.                     | Model/partial | Required baseline, Week 3    |
| Bulk import                       | Validated CSV template, dry-run preview, row-level errors, idempotent re-import, and downloadable outcome. Import cannot bypass authorization or tenant invariants.              | Not started   | Required, Week 3             |
| Employee self-service             | Edit permitted profile fields, view job/manager/schedule, manage emergency contact, and submit sensitive changes for approval where configured.                                  | Partial       | Required baseline, Week 4    |
| Documents and records             | Secure file storage, document types, expiry, visibility, acknowledgement, retention, download audit, and employee/HR views. Do not store large documents directly in PostgreSQL. | Not started   | Basic Week 7; advanced later |
| Custom fields                     | Organization-defined fields with type, validation, visibility, requiredness, and reporting behavior. Schema changes are versioned.                                               | Not started   | Deferred                     |
| Onboarding/offboarding checklists | Configurable tasks, owners, due dates, dependencies, reminders, document collection, equipment handoff, and completion evidence.                                                 | Not started   | Deferred                     |

### 3. Time, Attendance, Scheduling, and Devices

| Capability                | Detailed definition / completion criteria                                                                                                                                                                 | Current            | Initial release target                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------ |
| Attendance capture        | Accept fingerprint devices, authorized web clock, manual import, and approved correction sources. Each event records source, time, confidence/location metadata where applicable, and immutable evidence. | Partial            | Required, Week 4                           |
| Device management         | Provision/rotate secrets, assign tenant and location, show online/offline/firmware state, start/cancel enrollment, revoke templates, diagnose sync, and audit operator actions.                           | Partial protocol   | Required, Week 5                           |
| Attendance policies       | Configurable grace, rounding, minimum/maximum hours, breaks, overnight shifts, late/early thresholds, weekends, holidays, missing punches, and overtime rules with effective dates.                       | Partial/hard-coded | Required baseline, Week 4                  |
| Scheduling                | Reusable shifts, rotating/flexible schedules, employee/team assignment, exceptions, timezone-safe overnight work, and schedule history.                                                                   | Partial            | Required baseline, Week 4; rotations later |
| Timesheets                | Daily/weekly calculated time, exceptions, manager review, lock/approve/reopen, comments, and export period. Raw evidence remains unchanged.                                                               | Not started        | Beta, Week 4                               |
| Corrections and approvals | Add/remove/replace events, configurable approval route, delegation, no self-approval, comments, SLA reminders, and atomic application to the derived timeline.                                            | Working/partial    | Required, Weeks 4-5                        |
| Attendance operations     | Live attendance, absences, late arrivals, missing punches, overtime, device health, drill-down, filters, and tenant-safe export.                                                                          | Partial            | Required baseline, Weeks 4-6               |
| Offline reliability       | Device queues scans with stable idempotency sequence, retries safely, reports clock/network health, and supports controlled firmware compatibility.                                                       | Partial            | Required baseline, Weeks 5-8               |

### 4. Leave and Work Calendar

| Capability           | Detailed definition / completion criteria                                                                                                                                                | Current                   | Initial release target    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------- |
| Leave policies       | Tenant-owned leave types with eligibility, paid/unpaid behavior, accrual cadence, proration, carry-forward, caps, negative balance, attachments, notice, half days, and effective dates. | Partial                   | Required baseline, Week 5 |
| Balances and accrual | Worker posts idempotent accrual transactions and adjustments with a ledger. Admins can explain every displayed balance. Year rollover is tested.                                         | Partial calculation/model | Required, Week 5          |
| Requests             | Request, validate conflicts/balance, approve/reject, cancel/withdraw, edit before approval, comment, attach evidence, and show a complete timeline.                                      | Partial                   | Required, Week 5          |
| Approval routing     | Configurable manager, HR, role, named approver, and threshold steps; fallback, delegation, escalation, and no-self-approval rules. Shared with other workflows.                          | Partial/hard-coded        | Required baseline, Week 5 |
| Calendars            | Tenant/location holiday calendars, weekly off-days, team absence calendar, privacy controls, and calendar feed/export.                                                                   | Partial/global            | Required baseline, Week 5 |

### 5. Communication and Workflow

| Capability               | Detailed definition / completion criteria                                                                                                                                              | Current        | Initial release target    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------- |
| Notifications            | In-app inbox and email for approvals, decisions, reminders, onboarding tasks, interviews, billing, and security. Preferences, deduplication, retry, and delivery status are supported. | Model only     | Required, Week 5          |
| Announcements            | Tenant-owned drafts, publish/schedule/expire, audience by unit/location/role, attachments, acknowledgement, and read reporting.                                                        | Partial/global | Required baseline, Week 7 |
| Reusable workflow engine | Versioned workflow definitions, ordered/parallel steps, conditions, fallback approvers, delegation, SLA/escalation, and immutable workflow instances.                                  | Not started    | Required baseline, Week 5 |
| Templates                | Versioned email, notification, form, and approval templates with safe variables and organization defaults.                                                                             | Not started    | Basic, Weeks 5-7          |

### 6. Recruitment and Onboarding

| Capability                 | Detailed definition / completion criteria                                                                                                                            | Current        | Initial release target |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------- |
| Job requisitions and posts | Tenant-owned requisition approval, job details, status, hiring team, configurable stages, public/private posting, and closing/archiving.                             | Partial/global | Beta, Week 7           |
| Candidate portal           | Public branded job list, accessible application, consent/privacy notice, secure upload, duplicate handling, and status communication.                                | Partial        | Beta, Week 7           |
| Applicant tracking         | Stage pipeline, assignment, notes, tags, rejection reasons, interview scheduling, scorecards, communication history, and hire conversion without duplicate identity. | Partial        | Beta baseline, Week 7  |
| New-hire conversion        | Approved candidate becomes a person/membership/employment through a reviewed flow and receives onboarding tasks and an account invitation.                           | Not started    | Beta, Week 7           |

### 7. Performance and Development

| Capability          | Detailed definition / completion criteria                                                                                               | Current                | Initial release target |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------- |
| Review templates    | Tenant-owned, versioned templates with validated question types, scales, visibility, applicability, and immutable historical rendering. | Partial/global/mutable | Beta, Week 7           |
| Review cycles       | Draft, launch, self/manager/peer inputs where enabled, reminders, submit, acknowledgement, reopen controls, and completion reporting.   | Partial                | Beta baseline, Week 7  |
| Goals and check-ins | Goals with owner, period, measures, status, comments, and linkage to review cycles; recurring manager check-ins.                        | Not started            | Deferred               |
| Manager notes       | Private/shared visibility, explicit authorization, retention, edit history, and access audit.                                           | Partial                | Beta baseline, Week 7  |

### 8. Reporting, Data, and Integrations

| Capability                  | Detailed definition / completion criteria                                                                                                                                     | Current     | Initial release target                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------- |
| Operational dashboards      | Role-scoped attendance, leave, headcount, recruitment, and performance metrics with documented definitions and drill-down.                                                    | Partial     | Required baseline, Week 7               |
| Exports                     | Asynchronous CSV/XLSX exports with filters, permission checks, expiry, download audit, and worker status. Attendance/payroll exports are configurable.                        | Model only  | Required, Week 6                        |
| Public API and webhooks     | Versioned tenant-scoped API keys, least-privilege scopes, rate limits, idempotency, signed outbound webhooks, retries, replay, and delivery logs.                             | Not started | Deferred or later beta                  |
| Payroll interoperability    | Country-neutral attendance, leave, overtime, and employee export profiles plus connector interface. Native tax/payroll calculation is explicitly outside the initial release. | Not started | Required export, Week 6                 |
| Email/calendar integrations | Provider abstraction for transactional email and calendar invitations; secrets are tenant-safe and rotatable.                                                                 | Not started | Required email, Week 5; calendar Week 7 |
| Data quality                | Import validation, duplicate detection, exception queues, documented metric definitions, and tenant-safe reconciliation tools.                                                | Not started | Required baseline, Weeks 3-8            |

### 9. Reliability, Security, and Compliance

| Capability                      | Detailed definition / completion criteria                                                                                                                                                | Current         | Initial release target          |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------- |
| Observability                   | Structured logs with correlation and tenant identifiers, metrics, traces where valuable, dashboards, alerting, and redaction of secrets/biometric/personal data.                         | Partial logging | Required, Weeks 1-8             |
| Background processing           | Durable jobs with idempotency, locking, retries/backoff, dead-letter visibility, job-run records, and safe tenant context.                                                               | Placeholder     | Required, Week 5                |
| Backups and recovery            | Automated encrypted backups, retention, restore drills, documented RPO/RTO, and tenant export recovery procedure.                                                                        | Partial         | Required, Weeks 6 and 8         |
| Security baseline               | Rate limits, CSRF/session protections, secure headers/cookies, dependency and secret scanning, least privilege, input/file validation, admin MFA, and recurring review.                  | Partial         | Required, Weeks 1-8             |
| Privacy                         | Data inventory, purpose/retention, consent where needed, access/export/deletion process, support-access controls, and incident handling.                                                 | Not started     | Required baseline, Week 8       |
| Quality and release safety      | Unit/integration/E2E coverage for critical flows, tenant-isolation tests, migration rehearsals, seeded demo data, preview/staging, rollback/forward-fix runbooks, and release checklist. | Partial         | Required, Weeks 1-8             |
| Accessibility and responsive UI | Keyboard operation, semantic structure, focus/error behavior, contrast, screen-reader labels, responsive tables/forms, and WCAG 2.2 AA audit of critical flows.                          | Unknown/partial | Required critical flows, Week 8 |

## Initial Commercial Packaging Hypothesis

Pricing should be validated with customers before amounts are chosen. The initial architecture
should support a base subscription, active-worker quantity, optional hardware, and add-on modules.

| Package         | Intended customer                                          | Included capability                                                                                                                                        |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core            | Pakistan-based offices with 5-20 people                    | Workforce core, employee self-service, announcements, web attendance, leave, standard reports, and email support. Fingerprint devices are optional.        |
| Growth          | Offices needing managers, automation, and talent workflows | Core plus advanced attendance policies, reusable workflows, recruitment, performance reviews, advanced exports, API/webhooks, and priority support.        |
| Scale           | Larger or regulated organizations                          | Growth plus custom roles/scopes, SSO/SCIM when available, longer audit retention, advanced security controls, sandbox, contracted limits, and SLA options. |
| Hardware add-on | Customers using fingerprint terminals                      | Device provisioning, enrollment, device-health operations, replacement support, and per-device limits.                                                     |

Entitlements must use stable feature keys such as `attendance.standard`,
`attendance.advanced_rules`, `leave`, `recruitment`, `performance`, `api`, and
`security.advanced`. UI names and plan marketing names can change without database migrations.

## Beyond the Initial Two-Month Release

These are valid future modules, but including them in the first commercial release would threaten
tenant safety and core workflow quality:

- native iOS/Android applications and kiosk mode;
- country-specific payroll and tax engines;
- benefits administration and compensation cycles;
- expenses, travel, equipment/assets, and procurement;
- learning management, skills, succession, and workforce planning;
- SSO/SAML, SCIM, directory synchronization, and enterprise data residency;
- desk/room booking and visitor management;
- case management, whistleblowing, and jurisdiction-specific labor compliance;
- marketplace connectors for payroll, accounting, collaboration, identity, and BI systems.

## Decisions Needed Before Scope Is Locked

1. Initial industry mix within Pakistan and whether regulated sectors should be excluded from the
   first release.
2. English-only launch or English plus Urdu, and the exact currency, invoicing, privacy, tax, and
   labor requirements that need professional validation.
3. Expected delivery team and whether fingerprint hardware remains an optional add-on.
4. Billing provider and commercial model: a flat base including a worker allowance, per active
   worker, modules, devices, manual invoices, or a hybrid.
5. Whether recruitment and performance are launch requirements or can remain beta modules.
6. Email, object storage, observability, and hosting providers.
7. Pilot customers willing to validate setup, policies, reporting, pricing, and support expectations.
