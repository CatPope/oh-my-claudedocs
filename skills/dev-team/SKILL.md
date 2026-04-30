---
name: dev-team
description: OMC team-based — full development flow orchestration including document gates (design approval, test-plan approval)
argument-hint: "[ralph] [task description]"
level: user
---

# Purpose

Orchestrate the full development flow including Docs OMC document gates using OMC `/team`.

# Use When

- Automating the entire development lifecycle
- User runs `/dev-team`

# Do Not Use When

- Simple code edits / bug fixes → edit directly
- Running only a specific phase → use that skill directly

# Ralph Support

`/dev-team ralph` enables persistent loop. Auto-retry on failure; complete after Architect verification.

**Phases requiring user input even in Ralph**: Planning (SRS/PRD unclear items, deep-interview), Design approval gate, test-plan approval gate, Final review (unresolved items). All other work proceeds autonomously.

# Configuration

Read from `<!-- DOCS-OMC-CONFIG-START -->` in CLAUDE.md:
- `team-ralph` → Ralph auto-activates
- `pause-on-complete: true` → prompt user after each phase

# Context Management

**Main (orchestrator) handles ONLY**: phase transitions, .claudeignore, gates, user communication, spawning sub-agents and receiving summaries (≤10 lines).

**Delegated to sub-agents**: all document/code read/write/review, test execution, file exploration. Independent tasks spawn in parallel. Cross-cutting files written by dedicated agent after related agents complete.

### .claudeignore by phase

| Phase entry | Add to .claudeignore |
|-------------|---------------------|
| Design | STP.md, GTM.md |
| Implementation | SRS/PRD.md, Architecture.md, DetailedSpec.md |
| Before test approval | Temporarily clear (full access) |
| After test approval | STP, GTM, SRS/PRD, Architecture, DetailedSpec |
| Final cleanup | test-plan.md, test-results/, performance/, security-checklist/ |

# Pause-on-Complete Protocol

When enabled: show completion summary + files + next phase overview. User says "continue" → proceed; requests changes → rework. For phases with approval gate, run checkpoint **before** the gate.

> `[Pause-on-Complete]` below refers to this protocol.

# Steps

## 0. Parse execution mode and pause-on-complete from CLAUDE.md

## 1. Pre-check

Confirm `/dev-init` complete (CLAUDE.md + docs/dev/ exist). If not, suggest running it.

## 2. Planning

1. Agree on project language
2. Project scale → SRS or PRD (skip if done)
3. `/deep-interview` — gather requirements
4. **Agent** → `/stp-framework`, optionally `/gtm-strategy`
5. **Agent(writer)** → write SRS/PRD (actively ask user about unclear/missing items — never guess)
6. Finalize scope → auto-install additional skills

[Pause-on-Complete]

## 3. Design

> Add planning docs to .claudeignore

1. **Agent** → `/architecture-doc`
2. DetailedSpec: YES → **Agent(writer)** / NO → record in ADR
3. **Agent(designer)** → UI/UX

[Pause-on-Complete] → approval gate

**Design approval gate**: record in CLAUDE.md and require user approval for speed/security trade-offs, governance level, Git rules, quality standards, tech stack.

## 4. Implementation

> Add design docs to .claudeignore

Parallel multi-agent implementation via OMC `/team`. Hooks run lint/format automatically. `debugger` handles errors, `code-reviewer` reviews code.

[Pause-on-Complete]

## 5. Testing

**5-1.** Back up `.claudeignore` → `.claudeignore.backup`, clear it.

**5-2.** Delegate to **Agent(qa-test-planner)**: draft test-plan if missing → parallel review (test-engineer + security-reviewer + code-reviewer) → auto-fix critical/medium → return summary.

[Pause-on-Complete] → test-plan approval gate (attach summary, don't run tests until approved)

**5-3.** Restore `.claudeignore.backup`, add previous-phase docs, delete backup.

**5-4.** Run tests:
1. Extract test matrix from test-plan
2. **Agent** → `/test-report`, `/performance-report`, `/security-report`
3. **Final artifact E2E mandatory**: check `final artifact` in CLAUDE.md, build/package, then E2E test (exe→run, Docker→build+start, Python→entrypoint, npm→pack+install, web→server+browser E2E, unspecified→ask user)

**5-5.** CI workflow: **Agent(executor)** writes CI steps → **Agent(verifier)** verifies coverage matches test-plan.

## 6. Final cleanup

> Add test docs to .claudeignore

**Agent(writer)** writes in parallel: db-schema, api-spec, env-guide, deploy-guide, limitations, README (as applicable).

[Pause-on-Complete]

## 7. Document review → `/docs-reviewer`

Scale-based delegation: large(10+ modules)=per module, medium(3-9)=per feature, small(1-2)=per phase.

## 8. Final verification

**Agent(verifier)** audits: doc presence/structure, code-doc consistency, test coverage, CI completeness, Git status. Unresolved items → ask user (fix/log issue/ignore).

## 9. Done

Reset .claudeignore, print document checklist, notify missing items. Ralph mode: after Architect verification, run `/oh-my-claudecode:cancel`.
