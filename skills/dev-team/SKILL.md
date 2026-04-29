---
name: dev-team
description: OMC team-based — full development flow orchestration including document gates (design approval, test-plan approval)
argument-hint: "[ralph] [task description]"
level: user
---

# Purpose

Orchestrate the full development flow including Docs OMC document gates using OMC `/team`.

# Use When

- You want to automate the entire development lifecycle
- The user runs `/dev-team`

# Do Not Use When

- Simple code edits / bug fixes → edit directly
- Running only a specific phase → use that skill directly

# Ralph Support

Enable Ralph's persistent loop with `/dev-team ralph`. On failure, auto-retry; complete after Architect verification.

### Phases that still require user input in Ralph mode

| Phase | What to ask | Why |
|-------|-------------|-----|
| Planning — SRS/PRD | Unclear requirements, scope | Errors in the base document cascade everywhere |
| Planning — deep-interview | Requirements gathering | Only the user knows this information |
| Design — approval gate | Governance, tech stack, quality standards | User consent required |
| Testing — test-plan approval | Test scope/strategy | User approval required |
| Final review — unresolved items | Fix / log issue / ignore | Requires user judgment |

All other work (code implementation, document writing, test execution, etc.) proceeds autonomously.

# Configuration

Read from the `<!-- DOCS-OMC-CONFIG-START -->` section in CLAUDE.md:
- **Default execution mode**: if `team-ralph`, Ralph activates automatically
- **pause-on-complete**: if `true`, prompt the user for confirmation after each phase before proceeding

# Context Management Principles

**Main (orchestrator) = phase transitions + gates + user communication only. Everything else is delegated to sub-agents.**

### What the main agent does

- Decides phase transitions, manages .claudeignore
- Confirms gates (approvals), communicates with the user
- Spawns sub-agents and receives result summaries (10 lines or fewer)

### What the main agent does NOT do (delegated to sub-agents)

- Writing / editing / reading documents (including Read)
- Code implementation / editing / review
- Writing / running tests, file analysis / exploration

### Delegation rules

- Sub-agents read, work on, and save files directly. The main agent only receives summaries.
- Independent tasks are spawned as **parallel** sub-agents.
- Cross-cutting files (CI, docker-compose, etc.) are written by a dedicated agent after all related agents have completed.

### .claudeignore updates by phase

| Phase entry | Files to add |
|-------------|--------------|
| Design | STP.md, GTM.md |
| Implementation | SRS/PRD.md, Architecture.md, DetailedSpec.md |
| Before test approval | Temporarily clear (full access) |
| After test approval | STP, GTM, SRS/PRD, Architecture, DetailedSpec |
| Final cleanup | test-plan.md, test-results/, performance/, security-checklist/ |

# Pause-on-Complete Protocol

When `pause-on-complete: true`, at the end of each phase:
1. Show completion summary + list of created/modified files + next phase overview
2. User says "continue" → proceed; requests changes → rework

For phases with an approval gate, run the checkpoint **before** the gate.

> `[Pause-on-Complete]` at the end of each phase below refers to this protocol.

# Steps

## 0. Check execution mode

Parse `default execution mode` and `pause-on-complete` from CLAUDE.md.

## 1. Pre-check

Confirm `/dev-init` is complete (CLAUDE.md and docs/dev/ exist). If not, suggest running it.

## 2. Planning phase

1. Agree on the project language
2. Determine project scale → choose SRS or PRD (skip if already done)
3. `/deep-interview` — gather requirements
4. **Agent** → write STP (`/stp-framework`)
5. **Agent** → write GTM (optional, `/gtm-strategy`)
6. **Agent(writer)** → write SRS/PRD

   > SRS/PRD is the foundation for all subsequent documents. Actively ask the user about anything unclear or missing. Never guess.

7. Finalize development scope → auto-install additional skills

[Pause-on-Complete]

## 3. Design phase

> Add planning documents to .claudeignore

1. **Agent** → `/architecture-doc`
2. Confirm whether to write DetailedSpec → YES: **Agent(writer)** writes it / NO: record in ADR
3. **Agent(designer)** → UI/UX design

[Pause-on-Complete] → followed by approval gate

### Design approval gate

Record in CLAUDE.md and require user approval for:
- Speed vs. security trade-offs, governance level, Git rules, code quality standards, tech stack

## 4. Implementation phase

> Add design documents to .claudeignore

- Parallel multi-agent implementation via OMC `/team`
- Hooks run lint/format automatically
- `debugger` handles errors, `code-reviewer` reviews code

[Pause-on-Complete]

## 5. Testing phase

### 5-1. Temporarily clear .claudeignore

Back up `.claudeignore` to `.claudeignore.backup`, then reset to an empty file.

### 5-2. Write and review test-plan (delegated as a batch)

Delegate entirely to **Agent(qa-test-planner)**:

1. **Draft**: if `docs/dev/test-plan.md` is missing or is a placeholder, read all documents and write it from scratch. Skip if content already exists.
2. **Parallel review across 3 areas**: spawn test-engineer (functional) + security-reviewer (security) + code-reviewer (performance) in parallel
3. **Auto-fix**: critical severity is mandatory, medium is applied, low is at discretion
4. **Return summary to main** (10 lines or fewer)

[Pause-on-Complete] → followed by approval gate

### test-plan approval gate

Attach the reviewed/revised test-plan summary and results from all 3 areas. Do not run tests until user approval.

### 5-3. Restore .claudeignore

Restore `.claudeignore.backup`, add previous-phase documents, then delete the backup.

### 5-4. Run tests

1. Extract the test type matrix from test-plan (type, path, command, CI inclusion)
2. **Agent** → run `/test-report`, `/performance-report`, `/security-report`
3. **E2E test of final artifact is mandatory**: check the `final artifact` entry in CLAUDE.md, build/package accordingly, then run E2E tests
   - exe → build then run execution test
   - Docker → image build + container startup test
   - Python script → entrypoint execution test
   - npm package → pack + install test
   - Web app → server startup + browser E2E
   - If not specified, ask the user

### 5-5. CI workflow (after tests complete)

> Cross-cutting rule: write after all test agents have completed

1. **Agent(executor)** → write/update CI steps based on the test type list
2. **Agent(verifier)** → verify CI covers all required types from test-plan. If any are missing, fix and re-verify.

## 6. Final cleanup

> Add test documents to .claudeignore

**Agent(writer)** writes maintenance documents in parallel:
db-schema (if DB), api-spec (if API), env-guide, deploy-guide, limitations, README

[Pause-on-Complete]

## 7. Document review (delegated to `/doc-review`)

| Scale | When to delegate | Scope |
|-------|-----------------|-------|
| Large (10+ modules) | On each module completion | That module |
| Medium (3–9 modules) | On major feature completion | That feature |
| Small (1–2 modules) | On phase transition | Everything |

**Agent(doc-reviewer)** → saves report + auto-fixes. Main agent receives only grade/fix summary.

## 8. Final verification

**Agent(verifier)** audits the full project:

- Document presence/structure (15-line header + L values) / code-document consistency / test coverage / CI completeness / Git status
- List unresolved items → ask the user how to handle each (fix now / log as issue / ignore)

## 9. Done

- Reset .claudeignore, print the full document checklist, notify of any missing items
- Ralph mode: after Architect verification, run `/oh-my-claudecode:cancel`
