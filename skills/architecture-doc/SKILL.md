---
name: architecture-doc
description: Generate Architecture.md — system overview, module/layer structure, data flow, infrastructure topology
level: user
---

# Purpose

Generate an architecture document for the project. Analyzes the codebase to produce a system overview, module/layer structure, data flow, and infrastructure topology, including Mermaid diagrams.

# Use When

- Writing an architecture document during the design phase
- Documenting the architecture of an existing project
- The user runs `/architecture-doc`

# Do Not Use When

- Only writing an ADR (Architecture Decision Record) → use the `architecture-decision-records` skill instead
- Only a diagram is needed → write Mermaid directly

# Steps

1. **Analyze the codebase**
   - Explore the project structure (directories, key files)
   - Analyze dependencies (package.json, requirements.txt, etc.)
   - Identify entry points and routing structure
   - Review data models/schemas

2. **Reference SRS/PRD**
   - Check architecture-related requirements in `docs/dev/SRS.md` or `docs/dev/PRD.md`
   - Incorporate non-functional requirements (performance, security, scalability)

3. **Write Architecture.md**
   - Follow the table of contents structure in `docs/dev/Architecture.template.md`
   - Write each section based on codebase analysis and requirements:
     - 1. System Overview (purpose, design principles, context diagram)
     - 2. Module/Layer Structure (layer diagram, module list, interfaces)
     - 3. Data Flow (flow diagram, transformation steps)
     - 4. Infrastructure Topology (deployment architecture, environment configuration)
     - 5. Communication Patterns (internal/external communication, event system)
     - 6. Scaling Strategy (horizontal/vertical scaling, caching)
     - 7. Security Architecture (authentication/authorization, encryption, networking)
     - 8. Technology Decision Summary (ADR references)

4. **Generate diagrams**
   - System context diagram (`.mmd` file)
   - Layer diagram
   - Data flow diagram
   - Deployment architecture diagram
   - The Hook automatically converts `.mmd` files to PNG on save

5. **Save files**
   - Save to `docs/dev/Architecture.md` (overwrite existing template)
   - Git commit (only commit the completed document)

6. **Completion summary**
   - List generated documents and diagrams
   - Advise that key architecture decisions should be recorded separately as ADRs
