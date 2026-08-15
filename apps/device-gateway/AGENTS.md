# Device Gateway Instructions

## Required context

- Read `docs/architecture/device-protocol.md`, `docs/architecture/overview.md`, `SECURITY.md`, and
  the root `AGENTS.md` before changing device behavior.

## Protocol and security

- This service accepts device traffic only. Do not add general portal or human workflow APIs.
- Preserve raw request bytes for signature verification. Authenticate the device before processing
  payloads and require the payload device ID to match the authenticated device.
- Scope devices, enrollments, fingerprint mappings, and scans to the device's organization and
  location where applicable.
- Keep scan ingestion and enrollment results idempotent. Preserve immutable scan evidence and
  stable replay responses.
- Validate all payloads with shared schemas. Return stable safe error codes; never send stack traces,
  internal exception messages, database details, hashes, or secrets to a device.
- Protocol changes require shared-schema, documentation, gateway-test, firmware compatibility, and
  rollout updates in the same change.

## Verification

- Test missing/invalid/stale credentials, device-ID mismatch, tenant mismatch, inactive devices,
  duplicate sequences/results, invalid transitions, and database failure handling.
- Run gateway-focused tests and all applicable root verification commands.
