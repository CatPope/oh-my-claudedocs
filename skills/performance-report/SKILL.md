---
name: performance-report
description: Performance test wrapper — saves benchmark results as date-stamped files under docs/dev/performance/
argument-hint: "[benchmark target or command]"
level: user
---

# Purpose

Run performance tests and save results to `docs/dev/performance/performance-YYYY-MM-DD.md`.

# Use When

- Preserving benchmark results as a document, or recording whether performance targets were met

# Steps

1. Discover performance test tools (check `package.json` for benchmark/perf/test:perf scripts; use argument if provided)
2. Run performance tests
3. Compare against SRS/PRD baselines if defined
4. Save to `docs/dev/performance/performance-YYYY-MM-DD.md` (append timestamp if date exists)
5. File structure: Run date, environment (OS/CPU/RAM/runtime), measurements table (item, baseline, actual, met), detailed results per metric (description, method, result), environment table, recommendations
6. Notify user of file path
7. Git commit (completed document only)
