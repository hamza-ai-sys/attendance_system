# Firmware Instructions

## Required context

- Read `docs/architecture/device-protocol.md`, `apps/firmware/README.md`, `SECURITY.md`, and the root
  `AGENTS.md` before changing firmware behavior.

## Device invariants

- Fingerprint templates remain inside the scanner. Never transmit biometric templates to the
  platform.
- Never log or commit Wi-Fi credentials, device secrets, signed payloads, or production identifiers.
- Sign the exact canonical request defined by the protocol and keep timestamps compatible with the
  gateway's accepted formats.
- Queue offline scans with a persistent, monotonically useful sequence and retry without changing
  their idempotency identity.
- Enrollment must honor server session IDs, expiry, cancellation, and replay-safe result reporting.
- Preserve compatibility with provisioned devices. Coordinate protocol changes with shared schemas,
  gateway behavior, documentation, and rollout/version handling.
- Avoid blocking the main loop for network or scanner work longer than hardware requirements demand;
  maintain reconnect and recovery behavior.

## Verification

- Keep hardware-independent logic covered by native tests.
- Run `pnpm firmware:test` and `pnpm firmware:build`. Run `pnpm firmware:test:device` when the
  change depends on scanner, Wi-Fi, timing, flash, or board behavior and hardware is available.
- Report hardware verification as skipped when it was not actually performed.
