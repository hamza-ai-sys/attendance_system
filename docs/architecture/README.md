# Architecture Documentation

This directory is the source of truth for system structure and technical contracts.

| Document                                               | Purpose                                                                                         |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| [`system-overview.md`](system-overview.md)             | Applications, responsibilities, data flow, and system principles.                               |
| [`database-architecture.md`](database-architecture.md) | Database domains, identity/employment boundaries, tenant ownership, invariants, and known gaps. |
| [`attendance-device-api.md`](attendance-device-api.md) | Device authentication, HTTP endpoints, heartbeat, scans, enrollment, and compatibility.         |
| [`decisions/`](decisions/)                             | Architecture Decision Record policy, index, template, and accepted decisions.                   |

Implementation instructions belong under [`../development/`](../development/). A significant new
or changed architectural decision must be recorded under [`decisions/`](decisions/).
