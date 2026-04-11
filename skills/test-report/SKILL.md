---
name: test-report
description: test-engineer + verifier 에이전트 래퍼 — 테스트 결과를 docs/dev/test-results/에 날짜별 파일로 저장
argument-hint: "[test scope or command]"
level: user
---

# Purpose

OMC의 `test-engineer` 에이전트로 테스트를 실행하고 `verifier` 에이전트로 검증한 뒤, 결과를 `docs/dev/test-results/test-YYYY-MM-DD.md` 파일로 저장한다.

# Use When

- 테스트 실행 결과를 문서로 보존하고 싶을 때
- 테스트 단계에서 체계적으로 결과를 기록할 때
- 사용자가 `/test-report`를 실행할 때

# Do Not Use When

- 테스트 결과를 파일로 저장할 필요 없이 콘솔에서만 확인할 때

# Steps

1. `test-engineer` 에이전트를 실행한다
   - 인자가 있으면 해당 범위/명령으로 테스트 실행
   - 인자가 없으면 프로젝트의 기본 테스트 스크립트 실행
2. `verifier` 에이전트로 테스트 결과를 검증한다
3. 결과를 캡처하여 다음 형식으로 파일을 생성한다:
   - 경로: `docs/dev/test-results/test-YYYY-MM-DD.md`
   - 동일 날짜에 이미 파일이 있으면 타임스탬프 추가

4. 파일 내용 구성:

```markdown
# 테스트 결과

- **실행 일시**: YYYY-MM-DD HH:mm
- **환경**: {{environment}}
- **테스트 도구**: {{test framework}}

## 결과 요약

| 항목 | 수치 |
|------|------|
| 전체 테스트 | |
| 통과 | |
| 실패 | |
| 건너뜀 | |
| 코드 커버리지 | |

## 실패 상세

| # | 테스트명 | 실패 원인 | 파일:라인 |
|---|----------|-----------|-----------|
| | | | |

## 커버리지 상세

| 모듈 | 라인 | 브랜치 | 함수 |
|------|------|--------|------|
| | | | |

## 검증 결과 (Verifier)
```

5. 생성된 파일 경로를 사용자에게 알린다
6. Git 커밋한다 (완성된 문서만 커밋)
