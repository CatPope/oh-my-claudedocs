---
name: docs-init
description: Stage-based document template deployment — plan(planning/design), test(testing), final(completion), all(everything)
argument-hint: "plan | test | final | all"
level: user
---

# Purpose

Deploy Docs OMC document templates by development stage.

# Use When

- After completing `/dev-init`, when you need to deploy document templates
- When transitioning between development stages and need documents for that stage

# Arguments

| Argument | Deployed Documents |
|----------|--------------------|
| `plan` (default) | SRS/PRD, STP, GTM, Architecture, DetailedSpec, adr/ |
| `test` | test-plan, test-results/, performance/, security-checklist/, review/ |
| `final` | db-schema, api-spec, env-guide, deploy-guide, limitations, README |
| `all` | plan + test + final |

# Steps

## 0. Prerequisites

Verify CLAUDE.md exists. If not, prompt the user to run `/dev-init` and stop.

## 1. Initialization Check

If existing documents are found, ask the user:
1. **Keep existing** — deploy only missing files (idempotent)
2. **Overwrite all** — reset everything with templates
3. **Selective reset** — overwrite only user-selected files

If no existing documents are found, proceed with deployment immediately.

## 2. Template Deployment

Copy the templates for the relevant stage from `skills/dev-init/templates/docs/dev/` into `docs/dev/`.

### plan

`*.template.md` → `docs/dev/`: SRS or PRD (based on CLAUDE.md selection), STP, GTM, Architecture, DetailedSpec + `docs/dev/adr/`

### test

`test-plan.template.md` → `docs/dev/test-plan.md` + directories: test-results/, performance/, security-checklist/, review/

**After deployment**: With user consent, **Agent(test-engineer)** automatically writes the test-plan based on the codebase and existing documents.

### final

`*.template.md` → `docs/dev/`: db-schema, api-spec, env-guide, deploy-guide, limitations, README

## 3. Completion Summary

List deployed and skipped files, then provide guidance on the next step.
