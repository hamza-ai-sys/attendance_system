# Worker Instructions

## Ownership

- The worker owns scheduled and asynchronous processing for notifications, reminders, accruals,
  exports, reports, cleanup, reconciliation, and similar durable work.
- Do not implement business jobs as an untracked cron callback. Persist or derive enough state to
  observe, retry, and reconcile every production job.

## Job guarantees

- Every job must carry explicit tenant context, be idempotent, and prevent unsafe concurrent
  execution with a lock or atomic claim.
- Define retry/backoff, terminal failure, and operator recovery behavior. Record job-run state and
  redact sensitive details.
- Use stable idempotency keys for externally visible effects such as email, exports, billing, and
  accrual transactions.
- Evaluate time-based rules in the organization's effective timezone while storing instants in UTC.
- Make reruns and catch-up processing safe; never assume the scheduler fires exactly once or on time.

## Verification

- Test success, duplicate execution, partial failure, retry, stale lock/claim, tenant isolation,
  invalid state, and recovery paths.
- Keep scheduling tests separate from job-domain tests. Run worker-focused tests and applicable
  root verification commands.
