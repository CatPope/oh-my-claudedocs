---
name: security-report
description: security-reviewer agent wrapper — saves security review results as date-stamped files under docs/dev/security-checklist/
argument-hint: "[target path or scope]"
level: user
---

# Purpose

Run `security-reviewer` agent (read-only, console output) and save results to `docs/dev/security-checklist/security-checklist-YYYY-MM-DD.md`.

# Use When

- Preserving security review results as a document during the testing phase

# Steps

1. Run `security-reviewer` agent (with argument scope, or entire project)
2. Capture output
3. Save to `docs/dev/security-checklist/security-checklist-YYYY-MM-DD.md` (append timestamp if date exists)
4. File structure: Date, scope, environment, summary table (category, pass/fail/N/A), detailed results table (check item, result, severity, action), recommendations
5. Notify user of file path
6. Git commit (completed document only)
