---
name: security-report
description: security-reviewer 에이전트 래퍼 — 보안 점검 결과를 docs/dev/security-checklist/에 날짜별 파일로 저장
argument-hint: "[target path or scope]"
level: user
---

# Purpose

OMC의 `security-reviewer` 에이전트를 실행하고, 콘솔 출력만 하는 읽기전용 에이전트의 결과를 캡처하여 `docs/dev/security-checklist/security-checklist-YYYY-MM-DD.md` 파일로 저장한다.

# Use When

- 보안 점검 결과를 문서로 보존하고 싶을 때
- 테스트 단계에서 보안 리뷰를 수행할 때
- 사용자가 `/security-report`를 실행할 때

# Do Not Use When

- 보안 점검 결과를 파일로 저장할 필요 없이 콘솔에서만 확인할 때 → `security-reviewer` 에이전트 직접 사용

# Steps

1. `security-reviewer` 에이전트를 실행한다
   - 인자가 있으면 해당 경로/범위를 대상으로 점검
   - 인자가 없으면 프로젝트 전체를 대상으로 점검
2. 에이전트의 출력 결과를 캡처한다
3. 다음 형식으로 파일을 생성한다:
   - 경로: `docs/dev/security-checklist/security-checklist-YYYY-MM-DD.md`
   - 동일 날짜에 이미 파일이 있으면 타임스탬프 추가 (`security-checklist-YYYY-MM-DD-HHmmss.md`)
4. 파일 내용 구성:

```markdown
# 보안 점검 결과

- **실행 일시**: YYYY-MM-DD HH:mm
- **점검 범위**: {{scope}}
- **환경**: {{environment}}

## 점검 결과 요약

| 항목 | 통과 | 실패 | 해당없음 |
|------|------|------|----------|
| 합계 | | | |

## 상세 결과

| # | 점검 항목 | 결과 | 심각도 | 조치 내용 |
|---|-----------|------|--------|-----------|
| | | 통과/실패/해당없음 | 높음/중간/낮음 | |

## 권고사항
```

5. 생성된 파일 경로를 사용자에게 알린다
6. Git 커밋한다 (완성된 문서만 커밋)
