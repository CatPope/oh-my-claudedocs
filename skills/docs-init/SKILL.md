---
name: docs-init
description: 단계별 문서 템플릿 배치 — plan(기획/설계), test(테스트), final(최종), all(전체)
argument-hint: "plan | test | final | all"
level: user
---

# Purpose

Docs OMC 문서 템플릿을 단계별로 배치한다. 개발 흐름에 맞춰 필요한 시점에 필요한 문서만 초기화할 수 있다.

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

## 2. 초기화 확인

사용자에게 진행 여부를 확인한다:

> `docs/dev/` 문서 템플릿을 배치합니다. 진행할까요?

### `all` 사용 시 추가 확인

`docs/dev/`에 기존 문서가 존재하면 사용자에게 질문한다:

> 기존 문서가 발견되었습니다:
> - SRS.md, Architecture.md, ...
>
> 어떻게 진행할까요?
> 1. **기존 문서 유지** — 없는 파일만 새로 배치
> 2. **전부 덮어쓰기** — 모든 문서를 템플릿으로 초기화
> 3. **선택 초기화** — 초기화할 문서를 직접 선택

선택에 따라:
- **1번**: 기존 동작과 동일 (멱등성)
- **2번**: 기존 파일을 템플릿으로 덮어씀
- **3번**: 기존 문서 목록을 보여주고, 사용자가 선택한 파일만 덮어씀

### `plan`, `test`, `final` 사용 시

해당 단계에 기존 문서가 존재하면 동일한 3가지 선택지를 제시한다. 기존 문서가 없으면 바로 배치 진행.

## 3. 템플릿 배치

`skills/dev-init/templates/docs/dev/`에서 해당 단계의 템플릿을 `docs/dev/`로 복사한다.

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
- `docs/dev/review/`

**템플릿 배치 후 자동 작성:**

1. 사용자에게 확인:
   > 테스트 계획서를 코드베이스 기반으로 자동 작성할까요?
2. 사용자가 동의하면 **Agent(test-engineer)** 가 다음을 수행:
   - SRS/PRD, Architecture 등 기존 문서 참조
   - 코드베이스 분석 (소스 구조, 기존 테스트, 의존성)
   - `test-plan.md` 템플릿의 각 섹션을 채움:
     - 테스트 범위 (대상/제외 항목)
     - 테스트 유형별 도구·대상 매핑
     - 테스트 환경 구성
     - 합격 기준 (CLAUDE.md의 커버리지 목표 반영)
     - 리스크 및 의존성
3. 작성 완료 후 사용자에게 검토 요청

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

## 4. 완료 안내

배치 결과를 요약한다:
- 새로 배치된 파일 목록
- 이미 존재하여 건너뛴 파일 목록
- 다음 단계 안내:
  - `plan` 완료 시: `/deep-interview`로 요구사항 수집 제안
  - `test` 완료 시: `test-plan.md` 작성 후 테스트 실행 안내
  - `final` 완료 시: 각 문서 작성 안내
  - `all` 완료 시: 전체 흐름 요약
