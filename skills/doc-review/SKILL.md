---
name: doc-review
description: Full document/code context review — generates a scored report by difficulty level + auto-fix
argument-hint: "[full | quick | module-name]"
level: user
---

# Purpose

Cross-reviews project documentation against the codebase to evaluate consistency, gaps, and code-doc divergence with a score, then generates a report at `docs/dev/review/review-YYYY-MM-DD.md`. Discovered issues are automatically fixed afterward.

# Use When

- When transitioning between development phases, after major decisions change, after a module/feature is complete, or during periodic reviews

# Arguments

| Argument | Description |
|----------|-------------|
| `full` | Deep review (default) |
| `quick` | Fast summary (existence check + major inconsistencies only) |
| module name | Review a specific module only (e.g., `auth`) |

# Steps

## 1. Determine Depth

`quick` → lightweight, `full` → deep, no argument → ask the user (lightweight/standard/deep).

## 2. Document Inventory

Scan `docs/dev/` → list existing documents + identify missing required documents based on the current phase.

## 3. Individual Document Validation

Read the table of contents first, then access only the needed sections:
- **Structure**: 15-line header + L-value table of contents
- **Completeness**: empty sections, TODOs, placeholders
- **Freshness**: last modified date vs. `git log`

## 4. Cross-Document Consistency (standard and above)

- Term consistency, decision alignment (SRS↔Architecture↔DetailedSpec), tech stack consistency

## 5. Code-Doc Divergence Analysis (standard and above)

- ADR decisions vs. code, SRS requirements vs. implementation, Architecture vs. code structure
- test-plan scope vs. test files, deploy-guide vs. CI/CD config

## 6. Future Direction (deep only)

Identify unimplemented requirements, unimplemented components, and technical debt.

## 7. Score Calculation

| Area | Weight | Deduction Criteria (examples) |
|------|--------|-------------------------------|
| Structure compliance | 10% | Header violation -20, L-value mismatch -10 |
| Document completeness | 25% | Empty section -15/each, TODO -5/each |
| Cross-doc consistency | 25% | Term inconsistency -10/item, decision conflict -20/item |
| Code-doc alignment | 30% | Unimplemented requirement -15/item, structure mismatch -20/item |
| Freshness | 10% | Not updated -15/doc, 30+ days stale -10/doc |

Grade: A(90+) B(75-89) C(60-74) D(40-59) F(0-39)

## 8. Report Writing

Save to `docs/dev/review/review-YYYY-MM-DD.md`. Contents include:
- Review metadata (date/time, depth, scope, overall grade)
- Per-area score table
- Document inventory, discovered issues (sorted by severity), code-doc divergence details
- Recommended action checklist
- Changes since previous review (if a prior report exists)

## 9. Auto-Fix

Fix priority order: structure violations → high → medium → low

- Delegate to **Agent(writer)**, fix independent documents in parallel
- Update the report checklist after fixes
- Re-score only the changed areas and append before/after scores at the bottom of the report
