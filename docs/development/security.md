# Secure Development

## Secrets and Sensitive Data

- Never commit or print real environment values, session tokens, passwords, device credentials,
  SMTP/billing keys, personal records, biometric data, database dumps, or production payloads.
- Use `.env.dev.example`, `.env.prod.example`, app-level `.env.dev.example` files, and
  `apps/firmware/include/config.example.h` for documented placeholders only.
- Redact sensitive values from logs, test fixtures, screenshots, exceptions, and support evidence.
- Fingerprint templates stay inside the scanner and must never be transmitted or stored by the
  platform.

## Application Boundaries

- Validate all untrusted input at the boundary.
- Authenticate, authorize, verify organization ownership and resource scope, and enforce
  entitlements before protected reads or writes.
- Never trust a client-supplied record, organization, employee, device, file, or export ID without
  proving it belongs to the active context.
- Navigation visibility and role display names are not access control.
- Return stable safe client errors. Keep stack traces, SQL/database details, hashes, and internal
  exception messages in redacted server logs only.

## Authentication and Credentials

- Use approved password hashing and secure session cookies.
- Support explicit session revocation and credential rotation.
- Apply rate limits to authentication, device, file, export, and other abuse-sensitive endpoints.
- Sign device requests exactly as specified in
  [`../architecture/attendance-device-api.md`](../architecture/attendance-device-api.md).
- Never expose stored device-key hashes or signature material.

## Files, Audit, and External Effects

- Validate uploaded file type and size, use non-guessable storage keys, authorize every download,
  and define retention and malware-scanning behavior.
- Audit security-, access-, employee-, approval-, export-, billing-, support-, and
  configuration-sensitive mutations.
- Make device scans, imports, accruals, notifications, exports, jobs, and billing webhooks
  idempotent.
- Verify signed webhook authenticity before recording or acting on an event.

## Reporting Vulnerabilities

Do not open a public issue containing an exploit, secret, authentication bypass, or production data
exposure. Contact the repository owner through a private channel and preserve only the evidence
needed to investigate safely.

Production security and infrastructure hardening are documented in
[`../deployment/security.md`](../deployment/security.md).
