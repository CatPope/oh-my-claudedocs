---
name: performance-report
description: 성능 테스트 래퍼 — 벤치마크 결과를 docs/dev/performance/에 날짜별 파일로 저장
argument-hint: "[benchmark target or command]"
level: user
---

# Purpose

성능 테스트를 실행하고 결과를 `docs/dev/performance/performance-YYYY-MM-DD.md` 파일로 저장한다.

# Use When

- 성능 벤치마크 결과를 문서로 보존하고 싶을 때
- 테스트 단계에서 성능 기준 달성 여부를 기록할 때
- 사용자가 `/performance-report`를 실행할 때

# Do Not Use When

- 간단한 성능 확인만 필요할 때 → 직접 벤치마크 도구 실행

# Steps

1. 프로젝트의 성능 테스트 도구/스크립트를 탐색한다
   - `package.json`의 `benchmark`, `perf`, `test:perf` 스크립트 확인
   - 인자가 있으면 해당 대상/명령으로 실행
2. 성능 테스트를 실행한다
3. SRS/PRD에 정의된 성능 기준값이 있으면 비교한다
4. 결과를 캡처하여 다음 형식으로 파일을 생성한다:
   - 경로: `docs/dev/performance/performance-YYYY-MM-DD.md`
   - 동일 날짜에 이미 파일이 있으면 타임스탬프 추가

5. 파일 내용 구성:

```markdown
# 성능 벤치마크 결과

- **실행 일시**: YYYY-MM-DD HH:mm
- **환경**: {{environment (OS, CPU, RAM, Node version 등)}}

## 측정 결과

| 항목 | 기준값 | 실측값 | 달성 여부 |
|------|--------|--------|-----------|
| | | | |

## 상세 결과

### {{측정 항목}}
- **설명**:
- **측정 방법**:
- **결과**:

## 환경 정보

| 항목 | 값 |
|------|-----|
| OS | |
| CPU | |
| RAM | |
| Runtime | |

## 개선 권고사항
```

6. 생성된 파일 경로를 사용자에게 알린다
7. Git 커밋한다 (완성된 문서만 커밋)
