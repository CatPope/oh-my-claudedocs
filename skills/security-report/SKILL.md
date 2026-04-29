---
name: security-report
description: security-reviewer agent wrapper — saves security review results as date-stamped files under docs/dev/security-checklist/
argument-hint: "[target path or scope]"
level: user
---

# Purpose

Runs the OMC `security-reviewer` agent and captures its output — which is a read-only agent that only prints to console — then saves the results to `docs/dev/security-checklist/security-checklist-YYYY-MM-DD.md`.

# Use When

- You want to preserve security review results as a document
- Running a security review during the testing phase
- The user invokes `/security-report`

# Do Not Use When

- You only need to view the results in the console without saving to a file → use the `security-reviewer` agent directly

# Steps

1. Run the `security-reviewer` agent
   - If an argument is provided, scope the review to that path/area
   - If no argument is provided, review the entire project
2. Capture the agent's output
3. Create a file in the following format:
   - Path: `docs/dev/security-checklist/security-checklist-YYYY-MM-DD.md`
   - If a file already exists for the same date, append a timestamp (`security-checklist-YYYY-MM-DD-HHmmss.md`)
4. File content structure:

```markdown
# Security Review Results

- **Date**: YYYY-MM-DD HH:mm
- **Scope**: {{scope}}
- **Environment**: {{environment}}

## Summary

| Category | Pass | Fail | N/A |
|----------|------|------|-----|
| Total    |      |      |     |

## Detailed Results

| # | Check Item | Result | Severity | Action |
|---|------------|--------|----------|--------|
|   |            | Pass/Fail/N/A | High/Medium/Low | |

## Recommendations
```

5. Notify the user of the generated file path
6. Commit to Git (only commit completed documents)
