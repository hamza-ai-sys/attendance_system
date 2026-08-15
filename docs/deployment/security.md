# Production Security

## Network and Transport

- Expose only required SSH, HTTP, and HTTPS ports through the host firewall.
- Terminate valid TLS for portal and device traffic and redirect plaintext HTTP.
- Keep PostgreSQL off the public internet. Bind application containers to localhost when nginx
  runs on the host.
- Restrict administrative and backup access to the minimum required operators.

## Secrets and Access

- Generate unique production database, session, device, email, storage, observability, and billing
  credentials. Do not reuse development values.
- Store production secrets outside Git, rotate them through a documented procedure, and revoke
  credentials immediately after suspected exposure.
- Provision every physical device with a unique random secret and store only its approved hash.
- Require least privilege and strong authentication for platform operators and production access.

## Database and Releases

- Apply committed migrations with `pnpm db:migrate:deploy`. Never run development migrations,
  `prisma db push`, or development seeds in production.
- Rehearse risky migrations against representative data and use expand-migrate-contract when old
  and new application versions may overlap.
- Validate container health and critical workflows before directing traffic to a release.
- Prefer a forward fix and preserve customer data; do not assume a destructive migration can be
  rolled back.

## Backups, Monitoring, and Incidents

- Encrypt backups, enforce retention, restrict access, monitor success, and perform measured restore
  drills against documented RPO/RTO targets.
- Redact secrets, biometric/personal data, tokens, and raw production payloads from logs and traces.
- Alert on authentication abuse, cross-tenant authorization failures, device ingestion failures,
  job backlogs, billing webhook failures, database capacity, and backup failures.
- Maintain incident, credential-rotation, tenant-export, and recovery runbooks with named ownership.

The environment-specific deployment steps are in [`vps-nginx.md`](vps-nginx.md). Secure coding and
vulnerability reporting are in [`../development/security.md`](../development/security.md).
