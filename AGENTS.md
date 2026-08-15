# Workforce Platform Agent Entry Point

These instructions apply to every AI coding assistant working in this repository.

Before changing anything:

1. Read [docs/development/ai-assisted-development.md](docs/development/ai-assisted-development.md) completely.
2. Read the documentation relevant to the task from the [documentation map](README.md#documentation).
3. Read the nearest nested `AGENTS.md` for the component being changed.
4. Inspect the working tree and preserve unrelated user changes.

The canonical rules live in `docs/`. This file and tool-specific adapter files are entry points only; they must not restate or override those rules.

If instructions conflict, follow the more specific instruction without weakening security, tenant isolation, testing, migration, or architecture-decision requirements.
