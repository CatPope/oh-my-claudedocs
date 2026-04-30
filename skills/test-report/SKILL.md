---
name: test-report
description: test-engineer + verifier agent wrapper — saves test results as date-stamped files under docs/dev/test-results/
argument-hint: "[test scope or command]"
level: user
---

# Purpose

Run tests via `test-engineer` agent, verify with `verifier` agent, save to `docs/dev/test-results/test-YYYY-MM-DD.md`.

# Use When

- Preserving test results as a document during the test phase

# Steps

1. Run `test-engineer` agent (with argument scope, or project default test script)
2. Verify results with `verifier` agent
3. Save to `docs/dev/test-results/test-YYYY-MM-DD.md` (append timestamp if date exists)
4. File structure: Run date/time, environment, test tool, summary table (total/passed/failed/skipped/coverage), failure details table (test name, reason, file:line), coverage details table (module, lines, branches, functions), verification result
5. Notify user of file path
6. Git commit (completed document only)
