---
name: dev-team
description: OMC team 기반 — 문서 게이트(설계 승인, test-plan 승인) 포함 개발 Flow 오케스트레이션
argument-hint: "[ralph] [task description]"
level: user
---

# Purpose

OMC의 `/team` 명령을 활용하여 Docs OMC 문서 체계의 게이트를 포함한 전체 개발 Flow를 오케스트레이션한다. 각 단계 전환 시 필수 문서의 존재/승인 여부를 확인한다.

# Use When

- 전체 개발 라이프사이클을 자동화하고 싶을 때
- 문서 기반 게이트를 포함한 체계적 개발이 필요할 때
- 사용자가 `/dev-team`을 실행할 때

# Do Not Use When

- 단순 코드 수정이나 버그 픽스 → 직접 수정
- 문서 없이 빠르게 개발하고 싶을 때 → OMC `/team` 직접 사용
- 특정 단계만 실행하고 싶을 때 → 해당 스킬 직접 사용

# Ralph 지원

`/dev-team ralph`으로 실행하면 Ralph 영속 루프가 활성화된다:
- 모든 작업이 완료될 때까지 자동 재시도
- Architect 검증 후 완료 처리
- 실패한 단계 자동 복구

### Ralph 모드에서도 사용자 질의가 필수인 단계

Ralph는 자율 반복 실행이 목적이지만, 다음 단계에서는 **반드시 사용자에게 질문하고 응답을 받아야 한다.** 추측으로 진행하지 않는다.

| 단계 | 질의 내용 | 이유 |
|------|-----------|------|
| 기획 — SRS/PRD 작성 | 불명확한 요구사항, 범위, 우선순위 | 기반 문서 오류 시 전체 프로젝트 대규모 수정 |
| 기획 — deep-interview | 사용자 요구사항 수집 | 사용자만 알고 있는 정보 |
| 설계 — 승인 게이트 | 거버넌스, 기술 스택, 코드 품질 기준 | 사용자 동의 필수 |
| 테스트 — test-plan 승인 | 테스트 범위/전략 확인 | 사용자 승인 필수 |
| 최종 점검 — 미완료 처리 | 보완/이슈/무시 선택 | 사용자 판단 필요 |

이 단계 외의 작업(코드 구현, 문서 작성, 테스트 실행, CI 구성 등)은 Ralph가 자율적으로 진행한다.

```
/dev-team                 → 일반 team 모드
/dev-team ralph           → Ralph 영속 루프 + team 모드
/dev-team ralph "설명"    → 작업 설명 포함
```

# 기본 실행 모드 설정

CLAUDE.md의 `<!-- DOCS-OMC-CONFIG-START -->` 영역의 `기본 실행 모드` 항목을 참조한다:

```markdown
| 기본 실행 모드 | team-ralph | dev-init | 예: dev-team ralph, team ralph, autopilot |
```

**동작 방식:**
1. `/dev-team` 실행 시 CLAUDE.md에서 `기본 실행 모드` 값 확인
2. `team-ralph` 또는 `dev-team ralph`이면 Ralph 영속 루프 자동 활성화
3. 명시적으로 `/dev-team ralph`을 입력한 경우에도 동일 (중복 적용 없음)

# Pause-on-Complete 설정

CLAUDE.md의 `<!-- DOCS-OMC-CONFIG-START -->` 영역에 다음 설정이 있으면,
각 단계 완료 시마다 사용자에게 확인을 받고 다음 단계로 진행한다:

```markdown
<!-- DOCS-OMC-CONFIG-START -->
pause-on-complete: true
<!-- DOCS-OMC-CONFIG-END -->
```

**동작 방식:**
1. 각 단계(기획, 설계, 구현, 테스트, 최종 정리) 완료 시 일시 정지
2. 사용자에게 완료 요약과 다음 단계 안내를 표시
3. 사용자가 승인하면 다음 단계 진행, 수정 요청 시 해당 단계 재작업
4. `pause-on-complete: false`이거나 설정이 없으면 기존 동작 유지 (게이트 단계만 정지)

# Context 관리 원칙

**메인 에이전트(오케스트레이터)는 단계 전환, 게이트 확인, 사용자 소통만 담당한다. 그 외 모든 실질 작업은 서브 에이전트에 위임한다.**

### 메인이 하는 것 (오케스트레이션만)

- 단계 전환 판단 및 .claudeignore 관리
- 게이트(승인) 확인 및 사용자 소통
- 서브 에이전트 spawn 및 결과 요약 수신
- 작업 간 의존성 조율 (선행 결과를 후속 에이전트에 전달)

### 메인이 하지 않는 것 (반드시 서브 에이전트에 위임)

- 문서 작성/수정 (Read 포함 — 메인 context에 문서 내용을 로드하지 않는다)
- 코드 구현/수정
- 코드 리뷰, 보안 리뷰, 성능 리뷰
- 테스트 작성/실행
- 파일 분석/탐색 (explore, grep 등)

### 위임 규칙

- 서브 에이전트가 파일을 직접 읽고, 작업하고, 파일로 저장한다
- 메인은 결과 요약(10줄 이내)만 수신한다
- 이전 단계 문서가 필요하면 서브 에이전트가 직접 읽는다 (메인 context에 로드하지 않음)
- 독립적인 작업은 서브 에이전트를 **병렬**로 spawn한다

### Cross-cutting 파일 규칙

여러 에이전트의 결과물이 하나의 파일에 반영되어야 하는 경우 (예: CI workflow, docker-compose, .env.example), 해당 파일은 **모든 관련 에이전트 완료 후** 별도 에이전트가 통합 작성한다. 병렬 에이전트와 동시에 작성하지 않는다.

```
메인 (오케스트레이터) — context 최소화, 판단과 조율만
  ├─ Agent(writer)            → SRS/PRD 작성 → 요약만 반환
  ├─ Agent(architect)         → Architecture 작성 → 요약만 반환
  ├─ Agent(qa-test-planner)   → test-plan 작성 → 요약만 반환
  ├─ Agent(test-engineer)     → 기능 테스트 검토 ─┐
  ├─ Agent(security-reviewer) → 보안 검토 ────────┼─ 병렬 실행
  ├─ Agent(code-reviewer)     → 성능 검토 ────────┘
  ├─ Agent(executor)          → 코드 구현 → 요약만 반환
  └─ Agent(writer)            → 최종 문서 6종 → 요약만 반환
```

**단계 전환 시 .claudeignore 자동 갱신:**

| 단계 진입 | .claudeignore에 추가 |
|-----------|---------------------|
| 설계 단계 | `docs/dev/STP.md`, `docs/dev/GTM.md` |
| 구현 단계 | `docs/dev/SRS.md` 또는 `docs/dev/PRD.md`, `docs/dev/Architecture.md`, `docs/dev/DetailedSpec.md` |
| 테스트 단계 (승인 전) | `.claudeignore` 임시 해제 — 모든 문서 접근 가능 |
| 테스트 단계 (승인 후) | `docs/dev/STP.md`, `docs/dev/GTM.md`, `docs/dev/SRS.md` 또는 `PRD.md`, `docs/dev/Architecture.md`, `docs/dev/DetailedSpec.md` |
| 최종 정리 | `docs/dev/test-plan.md`, `docs/dev/test-results/`, `docs/dev/performance/`, `docs/dev/security-checklist/` |

# Steps

## 0. 실행 모드 확인

1. CLAUDE.md에서 `<!-- DOCS-OMC-CONFIG-START -->` ~ `<!-- DOCS-OMC-CONFIG-END -->` 영역 파싱
2. `기본 실행 모드` 값 확인
3. 값이 `team-ralph` 또는 `dev-team ralph`이거나 사용자가 `ralph` 인자를 전달한 경우 → Ralph 영속 루프 활성화
4. `pause-on-complete: true` 설정 확인 → 단계별 일시 정지 활성화

## 1. 사전 확인

- `/dev-init` 완료 여부 확인 (CLAUDE.md, docs/dev/ 존재)
- 미완료 시 `/dev-init` 실행을 제안

## 2. 기획 단계

1. 합의 언어 결정
2. 프로젝트 규모 확인 → SRS/PRD 선택 (이미 완료되었으면 건너뜀)
3. `/deep-interview` 실행 — 요구사항 수집
4. **Agent** → STP 작성 (`/stp-framework` 스킬 사용)
5. **Agent** → GTM 작성 (선택, 사용자 확인 후, `/gtm-strategy` 스킬 사용)
6. **Agent(writer)** → SRS 또는 PRD 작성 (deep-interview 결과 + 템플릿 목차 기반)

   > **이 단계는 전체 프로젝트에서 가장 중요하다.** SRS/PRD는 이후 Architecture, DetailedSpec, test-plan, 구현 코드의 기반이 된다. 여기서 요구사항이 불명확하거나 누락되면 설계·구현·테스트 전 단계를 대규모로 수정해야 한다. 따라서 에이전트는 추측으로 빈칸을 채우지 않고, 사용자에게 적극적으로 질문하여 정보를 수집한다.

   - 에이전트에게 deep-interview 결과 파일 경로와 템플릿 경로를 전달
   - 에이전트가 직접 읽고 작성 후 파일 저장
   - **사용자 질의 의무**: 작성 중 불명확하거나 누락된 정보가 있으면 사용자에게 즉시 질문한다. 모호한 요구사항, 미정의 범위, 우선순위 불분명 항목은 반드시 확인 후 작성한다.
   - 메인은 요약만 수신
7. 개발 범위 확정 → 추가 스킬 자동 설치

### ** Pause-on-Complete 체크포인트 ** (pause-on-complete: true인 경우)

> 이 단계의 결과를 사용자에게 요약하고 확인을 받는다:
> - 완료된 작업 목록
> - 생성/수정된 파일 목록
> - 다음 단계 안내
> 사용자가 "계속"하면 다음 단계로 진행한다. 수정 요청 시 해당 단계를 재작업한다.

## 3. 설계 단계

> .claudeignore에 기획 문서 추가 (STP, GTM)

1. **Agent** → `/architecture-doc` 실행 — Architecture 문서 생성
2. DetailedSpec 작성 여부 확인 (사용자 선택)
   - YES → **Agent(writer)** → 목차 기반으로 작성, 요약만 반환
   - NO → **Agent(writer)** → ADR에 판단 근거 기록
3. **Agent(designer)** → UI/UX 설계

### ** Pause-on-Complete 체크포인트 ** (pause-on-complete: true인 경우)

> 이 단계의 결과를 사용자에게 요약하고 확인을 받는다:
> - 완료된 작업 목록
> - 생성/수정된 파일 목록
> - 다음 단계 안내
> 사용자가 "계속"하면 다음 단계로 진행한다. 수정 요청 시 해당 단계를 재작업한다.

> 참고: 이 단계에는 이미 승인 게이트가 있으므로, pause-on-complete 체크포인트는 승인 게이트 이전에 실행된다.

### ** 설계 승인 게이트 **

다음 항목을 CLAUDE.md에 기록 후 사용자 승인을 받아야 구현 단계로 진행:
- 속도 vs 보안 판단 결과 (에이전트 자동)
- 거버넌스 단계 (사용자 선택)
- Git 규칙 (사용자 동의)
- 코드 품질 기준 (사용자 동의)
- 기술 스택 확정 (사용자 선택)

> 사용자가 승인하지 않으면 구현 단계로 진행하지 않는다.

## 4. 구현 단계

> .claudeignore에 설계 문서 추가 (SRS/PRD, Architecture, DetailedSpec)

- OMC `/team` 명령으로 구현 실행 (멀티 에이전트 병렬)
- Hook이 린트/포맷을 자동 실행 (pre-commit-check)
- Hook이 .mmd 파일을 자동 변환 (post-save-mmd)
- `debugger` 에이전트로 에러 처리
- `code-reviewer` 에이전트로 코드 리뷰

### ** Pause-on-Complete 체크포인트 ** (pause-on-complete: true인 경우)

> 이 단계의 결과를 사용자에게 요약하고 확인을 받는다:
> - 완료된 작업 목록
> - 생성/수정된 파일 목록
> - 다음 단계 안내
> 사용자가 "계속"하면 다음 단계로 진행한다. 수정 요청 시 해당 단계를 재작업한다.

## 5. 테스트 단계

### 5-1. .claudeignore 임시 해제

모든 문서에 접근 가능하도록 `.claudeignore`를 임시 해제한다:
1. `.claudeignore` → `.claudeignore.backup` 백업
2. `.claudeignore`를 빈 파일로 초기화

### 5-2. test-plan 작성 + 검토 (일괄 위임)

이 단계는 **하나의 서브 에이전트**에 일괄 위임한다. 메인은 최종 요약만 수신한다.

**Agent(qa-test-planner)** → 다음을 순서대로 수행:

#### A. 초안 작성

`docs/dev/test-plan.md`가 이미 존재하고 내용이 채워져 있으면 (예: `/docs-init test`에서 자동 작성된 경우) 초안 작성을 건너뛰고 B단계로 진입한다.

존재하지 않거나 템플릿 상태(placeholder만 있는 경우)이면:
- 모든 문서(SRS/PRD, Architecture, DetailedSpec, ADR 등)를 참조하여 작성
- `docs/dev/test-plan.md`에 저장

#### B. 3분야 병렬 검토

3개 검토 에이전트를 **병렬**로 spawn한다:

```
Agent(qa-test-planner)
  ├─ Agent(test-engineer)     → Functional Test 검증
  ├─ Agent(security-reviewer) → Security 검증
  └─ Agent(code-reviewer)     → Performance 검증
  │
  ▼ 검토 결과 수집
```

| 에이전트 | 검토 관점 |
|----------|-----------|
| **test-engineer** | 기능 테스트 커버리지, 경계값, 에러 케이스, 테스트 시나리오 완성도 |
| **security-reviewer** | 보안 테스트 항목 누락, 인증/인가/입력 검증/OWASP 관련 테스트 |
| **code-reviewer** | 성능 테스트 항목 누락, 부하/스트레스/응답시간 테스트 적절성 |

각 에이전트는 `docs/dev/test-plan.md`를 직접 읽고 다음 형식으로 결과를 반환한다:
```
- [심각도: 높음/중간/낮음] 이슈 설명 + 수정 제안
```

#### C. 자동 수정

3개 검토 결과를 통합하여 `docs/dev/test-plan.md`를 수정:
- 심각도 '높음' 항목은 반드시 반영
- 심각도 '중간' 항목은 반영
- 심각도 '낮음' 항목은 판단 후 반영

#### D. 메인에 요약 반환

메인에는 다음만 반환한다 (10줄 이내):
- 작성/검토 완료 여부
- 3분야 검토 결과 요약 (발견 이슈 수, 심각도별 분포)
- 자동 수정 내역

### ** Pause-on-Complete 체크포인트 ** (pause-on-complete: true인 경우)

> 이 단계의 결과를 사용자에게 요약하고 확인을 받는다:
> - test-plan 초안 작성 결과
> - 3분야 검토 결과 요약 (발견 이슈 수, 심각도별 분포)
> - 자동 수정 내역
> - 다음 단계 안내
> 사용자가 "계속"하면 다음 단계로 진행한다. 수정 요청 시 해당 단계를 재작업한다.

> 참고: 이 단계에는 이미 승인 게이트가 있으므로, pause-on-complete 체크포인트는 승인 게이트 이전에 실행된다.

### ** test-plan 승인 게이트 **

사용자에게 최종 test-plan을 제시하고 승인을 받는다:
- 검토/수정 완료된 test-plan 요약 표시
- 3분야 검토 결과 요약 첨부
- 사용자 승인 필수 — 승인 전까지 테스트를 실행하지 않는다

### 5-5. .claudeignore 복원 및 단계 전환

승인 완료 후:
1. `.claudeignore.backup` → `.claudeignore` 복원
2. 테스트 이전 단계 문서를 `.claudeignore`에 추가:
   - `docs/dev/STP.md`, `docs/dev/GTM.md`
   - `docs/dev/SRS.md` 또는 `docs/dev/PRD.md`
   - `docs/dev/Architecture.md`, `docs/dev/DetailedSpec.md`
3. `.claudeignore.backup` 삭제

### 5-6. 테스트 유형 목록 추출

test-plan에서 모든 테스트 유형을 매트릭스로 추출한다. 이 목록은 이후 테스트 에이전트 + CI 에이전트에 전달된다.

```
| 유형 | 프로젝트 경로 | 실행 명령 | CI 포함 |
|------|--------------|----------|:-------:|
| 백엔드 단위 | backend/ | pytest tests/unit | 필수 |
| 프론트엔드 단위 | frontend/ | npm test | 필수 |
| E2E | frontend/ | npm run test:e2e | 선택 |
| ... | ... | ... | ... |
```

### 5-7. 테스트 실행

테스트 유형 목록의 각 항목에 대해 에이전트를 실행한다:
- **Agent** → `/test-report` 실행 — 테스트 결과 저장
- **Agent** → `/performance-report` 실행 — 성능 벤치마크 저장
- **Agent** → `/security-report` 실행 — 보안 점검 결과 저장

### 5-8. CI 워크플로우 작성 (테스트 완료 후)

> **cross-cutting 규칙 적용**: CI 워크플로우는 모든 테스트 에이전트 완료 후 작성한다. 테스트와 병렬로 작성하지 않는다.

**Agent(executor)** → CI 워크플로우 작성/갱신:
- 5-6에서 추출한 **테스트 유형 목록 전체**를 에이전트에 전달한다
- test-plan의 모든 "필수" 테스트 유형에 대해 CI step을 작성한다
- 각 유형의 프로젝트 경로와 실행 명령을 CI에 매핑한다
- 기존 CI 파일이 있으면 누락된 step만 추가한다

### 5-9. CI 완전성 검증

**Agent(verifier)** → CI가 test-plan의 모든 테스트를 커버하는지 검증:
1. test-plan의 모든 "필수" 유형이 CI step에 존재하는가
2. 각 CI step의 실행 명령이 실제 테스트 파일 경로와 일치하는가
3. 누락 발견 시 → CI 파일 보완 후 재검증

> 이 검증을 통과해야 테스트 단계 완료로 처리한다.

## 6. 개발 완료 후 (최종 정리)

> .claudeignore에 테스트 문서 추가 (test-plan, test-results, performance, security-checklist)

완성된 코드를 기반으로 유지보수 문서를 **서브 에이전트가** 작성:

- **Agent(writer)** → db-schema (DB 사용 시)
- **Agent(writer)** → api-spec (API 존재 시)
- **Agent(writer)** → env-guide
- **Agent(writer)** → deploy-guide
- **Agent(writer)** → limitations
- **Agent(writer)** → README

각 에이전트는 코드베이스를 직접 분석하여 작성하고, 메인은 요약만 수신한다.
독립적인 문서는 병렬로 작성한다.

### ** Pause-on-Complete 체크포인트 ** (pause-on-complete: true인 경우)

> 이 단계의 결과를 사용자에게 요약하고 확인을 받는다:
> - 완료된 작업 목록
> - 생성/수정된 파일 목록
> - 다음 단계 안내
> 사용자가 "계속"하면 다음 단계로 진행한다. 수정 요청 시 해당 단계를 재작업한다.

## 7. 문서 검토 (`/doc-review` 자동 위임)

프로젝트 규모에 따라 적절한 시점에 서브 에이전트로 `/doc-review`를 위임한다:

| 규모 | 위임 시점 | 검토 범위 |
|------|-----------|-----------|
| **대규모** (10+ 모듈) | 각 모듈 작업 완료 시 | 해당 모듈만 (`/doc-review module-name`) |
| **중규모** (3~9 모듈) | 주요 기능 완료 시 | 해당 기능 (`/doc-review module-name`) |
| **소규모** (1~2 모듈) | 단계 전환 시 | 전체 (`/doc-review full`) |

> 대규모 프로젝트에서는 구현 단계(Step 4) 중 모듈 단위로, 소규모에서는 최종 정리(Step 6) 이후에 실행한다.

**Agent(doc-reviewer)** → `/doc-review` 실행:
- 보고서를 `docs/dev/review/review-YYYY-MM-DD.md`에 저장
- 발견된 이슈 자동 수정
- 메인에는 종합 등급과 수정 내역 요약만 반환 (10줄 이내)

## 8. 최종 점검

모든 단계 완료 후, **Agent(verifier)** 가 전체 프로젝트를 점검한다:

### 7-1. 산출물 완전성 검증

| 검증 항목 | 방법 |
|-----------|------|
| 문서 존재 여부 | `docs/dev/` 내 필수 문서가 모두 존재하는지 확인 |
| 문서 구조 | 15줄 헤더 + L값 목차 규칙 준수 여부 |
| 코드-문서 정합성 | Architecture/DetailedSpec의 모듈 구조가 실제 코드와 일치하는지 |
| 테스트 커버리지 | test-plan의 모든 필수 항목이 실행되었는지 (test-results 참조) |
| CI 완전성 | CI workflow가 모든 필수 테스트를 포함하는지 |
| Git 상태 | 미커밋 변경, 미병합 브랜치 유무 |

### 7-2. 미완료 작업 목록 생성

점검 결과를 기반으로 미완료 항목을 목록화한다:

```
## 미완료 작업
- [ ] 항목 — 사유 — 권장 조치
```

- 미완료 항목이 있으면 사용자에게 보고하고 처리 방법을 확인한다:
  - **지금 처리** → 해당 단계로 돌아가 보완
  - **이슈로 남기기** → limitations.md 또는 GitHub Issue에 기록
  - **무시** → 사용자가 의도적으로 생략

### 7-3. 최종 보고

- 미완료 항목이 없거나 사용자가 모두 처리/확인한 후 완료 단계로 진입

## 9. 완료

- .claudeignore 초기화 (모든 문서 다시 접근 가능)
- 전체 문서 체크리스트 출력
- 누락 문서 알림
- Ralph 모드인 경우 Architect 검증 후 `/oh-my-claudecode:cancel` 실행
- 완료 요약
