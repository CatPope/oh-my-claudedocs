---
name: docs-reviewer
description: Full document/code context review — generates a scored report by difficulty level + auto-fix
argument-hint: "[full | quick | module-name]"
level: user
---

# Purpose

Cross-review project docs against the codebase for consistency, gaps, and divergence. Generate a scored report at `docs/dev/review/review-YYYY-MM-DD.md` and auto-fix discovered issues.

# Use When

- Phase transitions, after major decisions, after module/feature completion, periodic reviews

# Arguments

| Arg | Description |
|-----|-------------|
| `full` | Deep review (default) |
| `quick` | Existence check + major inconsistencies only |
| module name | Specific module only (e.g., `auth`) |

# Steps

## 1. Determine depth: `quick`→lightweight, `full`→deep, none→ask user

## 2. Scan `docs/dev/` → list existing + identify missing required docs for current phase

## 3. Individual validation (read TOC first, access sections by L-value)
- Structure: 15-line header + L-value TOC
- Completeness: empty sections, TODOs, placeholders
- Freshness: last modified vs. `git log`

## 4. Cross-doc consistency (standard+): term consistency, decision alignment (SRS↔Architecture↔DetailedSpec), tech stack

## 5. Code-doc divergence (standard+): ADR vs code, SRS vs implementation, Architecture vs code, test-plan vs test files, deploy-guide vs CI

## 6. Future direction (deep only): unimplemented requirements, components, tech debt

## 7. Score

| Area | Weight |
|------|--------|
| Structure compliance | 10% |
| Document completeness | 25% |
| Cross-doc consistency | 25% |
| Code-doc alignment | 30% |
| Freshness | 10% |

Grade: A(90+) B(75-89) C(60-74) D(40-59) F(0-39)

## 8. Save report to `docs/dev/review/review-YYYY-MM-DD.md`

Include: metadata, per-area scores, inventory, issues by severity, divergence details, action checklist, changes since previous review.

## 9. Auto-fix (priority: structure → high → medium → low)

Delegate to **Agent(writer)**, fix independent docs in parallel. Update checklist, re-score changed areas, append before/after scores.
