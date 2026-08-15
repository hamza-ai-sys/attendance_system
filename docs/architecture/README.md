# Architecture Documentation

This directory is the source of truth for system structure and technical contracts.

| Document                                                   | Purpose                                                                                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [`overview.md`](overview.md)                               | Applications, responsibilities, data flow, and system principles.                               |
| [`data-model.md`](data-model.md)                           | Database domains, identity/employment boundaries, tenant ownership, invariants, and known gaps. |
| [`portal-module-structure.md`](portal-module-structure.md) | Portal module responsibilities, structure, naming, and size boundaries.                         |
| [`device-protocol.md`](device-protocol.md)                 | Device authentication, heartbeat, scans, enrollment, and compatibility contract.                |
| [`approval-workflow.md`](approval-workflow.md)             | Current sequential attendance-approval rules.                                                   |
| [`decisions/`](decisions/)                                 | Architecture Decision Record policy, index, template, and accepted decisions.                   |

Implementation instructions belong under [`../development/`](../development/). A significant new
or changed architectural decision must be recorded under [`decisions/`](decisions/).
