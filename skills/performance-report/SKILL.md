---
name: performance-report
description: Performance test wrapper — saves benchmark results as date-stamped files under docs/dev/performance/
argument-hint: "[benchmark target or command]"
level: user
---

# Purpose

Run performance tests and save the results to `docs/dev/performance/performance-YYYY-MM-DD.md`.

# Use When

- You want to preserve benchmark results as a document
- You need to record whether performance targets were met during the test phase
- The user runs `/performance-report`

# Do Not Use When

- You only need a quick performance check → run the benchmark tool directly

# Steps

1. Discover the project's performance test tools or scripts
   - Check `package.json` for `benchmark`, `perf`, or `test:perf` scripts
   - If an argument was provided, run with that target or command
2. Run the performance tests
3. If performance baselines are defined in the SRS/PRD, compare against them
4. Capture the results and create a file in the following format:
   - Path: `docs/dev/performance/performance-YYYY-MM-DD.md`
   - If a file already exists for that date, append a timestamp suffix

5. File content structure:

```markdown
# Performance Benchmark Results

- **Run date**: YYYY-MM-DD HH:mm
- **Environment**: {{environment (OS, CPU, RAM, Node version, etc.)}}

## Measurements

| Item | Baseline | Actual | Met |
|------|----------|--------|-----|
| | | | |

## Detailed Results

### {{metric name}}
- **Description**:
- **Method**:
- **Result**:

## Environment

| Item | Value |
|------|-------|
| OS | |
| CPU | |
| RAM | |
| Runtime | |

## Recommendations
```

6. Notify the user of the generated file path
7. Commit to Git (only commit completed documents)
