---
name: test-report
description: test-engineer + verifier agent wrapper — saves test results as date-stamped files under docs/dev/test-results/
argument-hint: "[test scope or command]"
level: user
---

# Purpose

Run tests using OMC's `test-engineer` agent, verify results with the `verifier` agent, and save the output to `docs/dev/test-results/test-YYYY-MM-DD.md`.

# Use When

- You want to preserve test run results as a document
- You need to systematically record results during the test phase
- The user runs `/test-report`

# Do Not Use When

- You only need to see test output in the console without saving to a file

# Steps

1. Run the `test-engineer` agent
   - If an argument is provided, run tests for that scope/command
   - If no argument is provided, run the project's default test script
2. Verify the test results with the `verifier` agent
3. Capture the results and create a file in the following format:
   - Path: `docs/dev/test-results/test-YYYY-MM-DD.md`
   - If a file already exists for that date, append a timestamp

4. File content structure:

```markdown
# Test Results

- **Run Date/Time**: YYYY-MM-DD HH:mm
- **Environment**: {{environment}}
- **Test Tool**: {{test framework}}

## Summary

| Item | Count |
|------|-------|
| Total Tests | |
| Passed | |
| Failed | |
| Skipped | |
| Code Coverage | |

## Failure Details

| # | Test Name | Failure Reason | File:Line |
|---|-----------|----------------|-----------|
| | | | |

## Coverage Details

| Module | Lines | Branches | Functions |
|--------|-------|----------|-----------|
| | | | |

## Verification Result (Verifier)
```

5. Notify the user of the generated file path
6. Commit to Git (only commit completed documents)
