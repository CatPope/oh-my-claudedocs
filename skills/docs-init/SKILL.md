---
name: docs-init
description: 단계별 문서 템플릿 배치 — plan(기획/설계), test(테스트), final(최종), all(전체)
argument-hint: "plan | test | final | all"
level: user
---

# Purpose

oh-my-claudedocs 문서 템플릿을 단계별로 배치한다. 개발 흐름에 맞춰 필요한 시점에 필요한 문서만 초기화할 수 있다.

# Use When

- `/dev-init` 완료 후 문서 템플릿을 배치할 때
- 개발 단계 전환 시 해당 단계의 문서가 필요할 때
- 사용자가 `/docs-init [plan|test|final|all]`을 실행할 때

# Do Not Use When

- `/dev-init`이 아직 실행되지 않았을 때 (CLAUDE.md 필요)
- 이미 배치된 문서를 다시 배치하려 할 때 (멱등성으로 건너뜀)

# Arguments

| 인자 | 단계 | 배치 문서 |
|------|------|----------|
| `plan` | 기획/설계 | SRS/PRD, STP, GTM, Architecture, DetailedSpec, adr/ |
| `test` | 테스트 | test-plan, test-results/, performance/, security-checklist/ |
| `final` | 최종 문서 | db-schema, api-spec, env-guide, deploy-guide, limitations, README |
| `all` | 전체 | 위 3단계 모두 |
| (없음) | 기본값 = `plan` | `plan`과 동일 |

# Steps

## 0. 선행 조건 확인

- 프로젝트 루트에 `CLAUDE.md`가 존재하는지 확인
- 없으면 `/dev-init`을 먼저 실행하라고 안내하고 중단

## 1. 인자 파싱

- 인자가 없으면 `plan`으로 처리
- `plan`, `test`, `final`, `all` 외의 값이면 사용법을 안내하고 중단

## 2. 템플릿 배치

`skills/dev-init/templates/docs/dev/`에서 해당 단계의 템플릿을 `docs/dev/`로 복사한다. 이미 존재하는 파일은 건너뜀 (멱등성).

### plan (기획/설계)

파일:
- `SRS.template.md` → `docs/dev/SRS.md` (CLAUDE.md의 SRS/PRD 선택에 따라)
- `PRD.template.md` → `docs/dev/PRD.md` (CLAUDE.md의 SRS/PRD 선택에 따라)
- `STP.template.md` → `docs/dev/STP.md`
- `GTM.template.md` → `docs/dev/GTM.md`
- `Architecture.template.md` → `docs/dev/Architecture.md`
- `DetailedSpec.template.md` → `docs/dev/DetailedSpec.md`

디렉토리:
- `docs/dev/adr/`

### test (테스트)

파일:
- `test-plan.template.md` → `docs/dev/test-plan.md`

디렉토리:
- `docs/dev/test-results/`
- `docs/dev/performance/`
- `docs/dev/security-checklist/`

### final (최종 문서)

파일:
- `db-schema.template.md` → `docs/dev/db-schema.md`
- `api-spec.template.md` → `docs/dev/api-spec.md`
- `env-guide.template.md` → `docs/dev/env-guide.md`
- `deploy-guide.template.md` → `docs/dev/deploy-guide.md`
- `limitations.template.md` → `docs/dev/limitations.md`
- `README.template.md` → `docs/dev/README.md`

### all (전체)

`plan` + `test` + `final`을 순서대로 실행한다.

## 3. 완료 안내

배치 결과를 요약한다:
- 새로 배치된 파일 목록
- 이미 존재하여 건너뛴 파일 목록
- 다음 단계 안내:
  - `plan` 완료 시: `/deep-interview`로 요구사항 수집 제안
  - `test` 완료 시: `test-plan.md` 작성 후 테스트 실행 안내
  - `final` 완료 시: 각 문서 작성 안내
  - `all` 완료 시: 전체 흐름 요약
