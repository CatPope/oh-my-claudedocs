---
name: dev-init
description: Initialize project development environment — Git, CLAUDE.md, external skill installation, SRS/PRD selection
argument-hint: "[project name]"
level: user
---

# Purpose

Set up the Docs OMC development environment for a new project. Places CLAUDE.md, installs external skills, and selects SRS/PRD. Document template placement is handled separately by `/docs-init`.

# Use When

- Starting a new project or introducing Docs OMC to an existing project

# Steps

## 0. Git Repository Setup

Check with `git status` and branch accordingly:

### Git Already Initialized

Check remote with `git remote -v`:
- **Remote exists** → Check .gitignore, then proceed to next step
- **No remote** → Ask the user: 1) Create on GitHub (`gh repo create`) 2) Keep local only (skip steps 4–5)

### No Git

Ask the user: 1) Create on GitHub (`gh repo create`) 2) Local only (`git init`) 3) Skip (note rollback limitations)

## 1. Place CLAUDE.md

Copy `CLAUDE.md.template` if missing. Skip if already present.

### Placeholder Fill Timing

| placeholder | when to fill |
|-------------|--------------|
| `{{LANGUAGE}}`, `{{COMMIT_CONVENTION}}`, `{{DEFAULT_MODE}}` | **dev-init** (ask at this step) |
| `{{BRANCH_STRATEGY}}` | Step 4 (auto-filled when branching strategy is selected) |
| `{{SPEED_OR_SECURITY}}`, `{{GOVERNANCE_LEVEL}}`, `{{COVERAGE_TARGET}}`, `{{COMPLEXITY_THRESHOLD}}`, `{{TECH_STACK}}`, `{{DELIVERABLE}}` | **Interview** (during `/deep-interview` — do not ask now) |

### Step 1 Question Flow

1. **Agreed language** → `{{LANGUAGE}}` (Korean/English/other)
2. **Commit convention** → `{{COMMIT_CONVENTION}}` (Conventional Commits/free form/custom)
3. **Default execution mode** → `{{DEFAULT_MODE}}` (dev-team ralph/dev-team/custom)

## 2. Discover and Install External Skills

Search with `find-skills`: stp-framework, gtm-strategy, architecture-decision-records, mermaid-cli. Skip any already installed.

## 3. Project Scale → SRS/PRD Selection

Small scale (MVP) → PRD / Medium–large scale (team) → SRS. Record the selection in CLAUDE.md.

## 4. Branching Strategy Selection (GitHub setup only)

| Strategy | CI push trigger | CI PR trigger |
|----------|----------------|---------------|
| GitHub Flow | `[main, master]` | `[main, master]` |
| Git Flow | `[main, master, develop, 'release/**']` | `[main, master, develop]` |
| Trunk-Based | `[main, master]` | `[main, master]` |

## 5. GitHub CI Setup (GitHub setup only)

Replace triggers based on step 4 selection and place files:
- `.github/workflows/docs-omc-ci.yml`, `.github/scripts/`(validate-docs-structure, scan-secrets, check-dependency-audit), `.github/pull_request_template.md`

Skip any files that already exist.

## 6. Completion Summary

Summarize initialization results and provide next step guidance:
- `/dev-team` — Full development flow orchestration (recommended)
- `/docs-init plan` — Place planning/design document templates only
- `/deep-interview` — Run requirements gathering standalone
