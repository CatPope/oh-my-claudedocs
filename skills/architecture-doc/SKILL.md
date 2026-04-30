---
name: architecture-doc
description: Generate Architecture.md — system overview, module/layer structure, data flow, infrastructure topology
level: user
---

# Purpose

Analyze the codebase and generate `docs/dev/Architecture.md` with system overview, module/layer structure, data flow, infrastructure topology, and Mermaid diagrams.

# Use When

- Writing architecture docs during design phase, or documenting existing project architecture

# Do Not Use When

- Only writing an ADR → use `architecture-decision-records` skill
- Only a diagram is needed → write Mermaid directly

# Steps

1. **Analyze codebase**: project structure, dependencies, entry points, routing, data models/schemas
2. **Reference SRS/PRD**: architecture-related requirements, non-functional requirements (performance, security, scalability)
3. **Write Architecture.md** following `docs/dev/Architecture.template.md` TOC: System Overview, Module/Layer Structure, Data Flow, Infrastructure Topology, Communication Patterns, Scaling Strategy, Security Architecture, Technology Decision Summary (ADR refs)
4. **Generate diagrams** (`.mmd`): system context, layer, data flow, deployment architecture. Hook auto-converts `.mmd` to PNG on save.
5. **Save** to `docs/dev/Architecture.md`, Git commit (completed document only)
6. **Summary**: list generated docs/diagrams, advise recording key decisions as ADRs
