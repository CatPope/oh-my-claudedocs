---
name: dev-team
description: OMC team 기반 — 문서 게이트(설계 승인, test-plan 승인) 포함 개발 Flow 오케스트레이션
argument-hint: "[ralph] [task description]"
level: user
---

# Purpose

OMC `/team`을 활용하여 Docs OMC 문서 게이트 포함 전체 개발 Flow를 오케스트레이션한다.

# Use When

- 전체 개발 라이프사이클을 자동화하고 싶을 때
- 사용자가 `/dev-team`을 실행할 때

# Do Not Use When

- 단순 코드 수정/버그 픽스 → 직접 수정
- 특정 단계만 실행 → 해당 스킬 직접 사용

# Ralph 지원

`/dev-team ralph`으로 Ralph 영속 루프 활성화. 실패 시 자동 재시도, Architect 검증 후 완료.

### Ralph에서도 사용자 질의 필수인 단계

| 단계 | 질의 내용 | 이유 |
|------|-----------|------|
| 기획 — SRS/PRD | 불명확한 요구사항, 범위 | 기반 문서 오류 시 전체 수정 |
| 기획 — deep-interview | 요구사항 수집 | 사용자만 아는 정보 |
| 설계 — 승인 게이트 | 거버넌스, 기술 스택, 품질 기준 | 사용자 동의 필수 |
| 테스트 — test-plan 승인 | 테스트 범위/전략 | 사용자 승인 필수 |
| 최종 점검 — 미완료 처리 | 보완/이슈/무시 선택 | 사용자 판단 필요 |

이 외 작업(코드 구현, 문서 작성, 테스트 실행 등)은 자율 진행.

# 설정

CLAUDE.md `<!-- DOCS-OMC-CONFIG-START -->` 영역에서 읽는다:
- **기본 실행 모드**: `team-ralph`이면 Ralph 자동 활성화
- **pause-on-complete**: `true`이면 각 단계 완료 시 사용자 확인 후 다음 단계 진행

# Context 관리 원칙

**메인(오케스트레이터) = 단계 전환 + 게이트 + 사용자 소통만. 나머지는 전부 서브 에이전트 위임.**

### 메인이 하는 것

- 단계 전환 판단, .claudeignore 관리
- 게이트(승인) 확인, 사용자 소통
- 서브 에이전트 spawn 및 결과 요약 수신 (10줄 이내)

### 메인이 하지 않는 것 (서브 에이전트 위임)

- 문서 작성/수정/읽기 (Read 포함)
- 코드 구현/수정/리뷰
- 테스트 작성/실행, 파일 분석/탐색

### 위임 규칙

- 서브 에이전트가 파일을 직접 읽고 작업하고 저장. 메인은 요약만 수신
- 독립 작업은 서브 에이전트를 **병렬** spawn
- Cross-cutting 파일(CI, docker-compose 등)은 모든 관련 에이전트 완료 후 별도 에이전트가 통합 작성

### .claudeignore 단계별 갱신

| 단계 진입 | 추가 대상 |
|-----------|-----------|
| 설계 | STP.md, GTM.md |
| 구현 | SRS/PRD.md, Architecture.md, DetailedSpec.md |
| 테스트 승인 전 | 임시 해제 (전체 접근) |
| 테스트 승인 후 | STP, GTM, SRS/PRD, Architecture, DetailedSpec |
| 최종 정리 | test-plan.md, test-results/, performance/, security-checklist/ |

# Pause-on-Complete 프로토콜

`pause-on-complete: true`인 경우, 각 단계 완료 시:
1. 완료 요약 + 생성/수정 파일 목록 + 다음 단계 안내 표시
2. 사용자 "계속" → 진행, 수정 요청 → 재작업

승인 게이트가 있는 단계는 게이트 **이전**에 체크포인트 실행.

> 이하 각 단계 말미의 `[Pause-on-Complete]`는 이 프로토콜을 의미한다.

# Steps

## 0. 실행 모드 확인

CLAUDE.md에서 `기본 실행 모드`와 `pause-on-complete` 파싱.

## 1. 사전 확인

`/dev-init` 완료 여부 확인 (CLAUDE.md, docs/dev/ 존재). 미완료 시 제안.

## 2. 기획 단계

1. 합의 언어 결정
2. 프로젝트 규모 → SRS/PRD 선택 (완료 시 건너뜀)
3. `/deep-interview` — 요구사항 수집
4. **Agent** → STP 작성 (`/stp-framework`)
5. **Agent** → GTM 작성 (선택, `/gtm-strategy`)
6. **Agent(writer)** → SRS/PRD 작성

   > SRS/PRD는 이후 모든 문서의 기반. 불명확/누락 시 사용자에게 적극 질문. 추측 금지.

7. 개발 범위 확정 → 추가 스킬 자동 설치

[Pause-on-Complete]

## 3. 설계 단계

> .claudeignore에 기획 문서 추가

1. **Agent** → `/architecture-doc`
2. DetailedSpec 작성 여부 확인 → YES: **Agent(writer)** 작성 / NO: ADR 기록
3. **Agent(designer)** → UI/UX 설계

[Pause-on-Complete] → 이후 승인 게이트

### 설계 승인 게이트

CLAUDE.md에 기록 후 사용자 승인 필수:
- 속도 vs 보안 판단, 거버넌스 단계, Git 규칙, 코드 품질 기준, 기술 스택

## 4. 구현 단계

> .claudeignore에 설계 문서 추가

- OMC `/team`으로 멀티 에이전트 병렬 구현
- Hook이 린트/포맷 자동 실행
- `debugger`로 에러 처리, `code-reviewer`로 코드 리뷰

[Pause-on-Complete]

## 5. 테스트 단계

### 5-1. .claudeignore 임시 해제

`.claudeignore` → `.claudeignore.backup` 백업 후 빈 파일로 초기화.

### 5-2. test-plan 작성 + 검토 (일괄 위임)

**Agent(qa-test-planner)** 에 일괄 위임:

1. **초안 작성**: `docs/dev/test-plan.md` 없거나 placeholder면 전체 문서 참조하여 작성. 이미 내용 있으면 건너뜀
2. **3분야 병렬 검토**: test-engineer(기능) + security-reviewer(보안) + code-reviewer(성능) 병렬 spawn
3. **자동 수정**: 심각도 높음 필수, 중간 반영, 낮음 판단
4. **메인에 요약 반환** (10줄 이내)

[Pause-on-Complete] → 이후 승인 게이트

### test-plan 승인 게이트

검토/수정 완료된 test-plan 요약 + 3분야 결과 첨부. 사용자 승인 전 테스트 미실행.

### 5-3. .claudeignore 복원

`.claudeignore.backup` 복원 + 이전 단계 문서 추가 + 백업 삭제.

### 5-4. 테스트 실행

1. test-plan에서 테스트 유형 매트릭스 추출 (유형, 경로, 명령, CI 포함 여부)
2. **Agent** → `/test-report`, `/performance-report`, `/security-report` 실행
3. **최종 산출물 E2E 테스트 필수**: CLAUDE.md의 `최종 산출물` 항목을 확인하고, 해당 산출물 형태로 빌드/패키징한 뒤 E2E 테스트를 실행한다
   - exe → 빌드 후 실행 테스트
   - Docker → 이미지 빌드 + 컨테이너 기동 테스트
   - Python 스크립트 → 엔트리포인트 실행 테스트
   - npm 패키지 → pack + 설치 테스트
   - 웹 앱 → 서버 기동 + 브라우저 E2E
   - 미지정 시 사용자에게 확인

### 5-5. CI 워크플로우 (테스트 완료 후)

> cross-cutting 규칙: 모든 테스트 에이전트 완료 후 작성

1. **Agent(executor)** → 테스트 유형 목록 기반 CI step 작성/갱신
2. **Agent(verifier)** → CI가 test-plan 필수 유형을 모두 커버하는지 검증. 누락 시 보완 후 재검증

## 6. 최종 정리

> .claudeignore에 테스트 문서 추가

**Agent(writer)** 병렬로 유지보수 문서 작성:
db-schema(DB 시), api-spec(API 시), env-guide, deploy-guide, limitations, README

[Pause-on-Complete]

## 7. 문서 검토 (`/doc-review` 위임)

| 규모 | 위임 시점 | 범위 |
|------|-----------|------|
| 대규모 (10+) | 각 모듈 완료 시 | 해당 모듈 |
| 중규모 (3~9) | 주요 기능 완료 시 | 해당 기능 |
| 소규모 (1~2) | 단계 전환 시 | 전체 |

**Agent(doc-reviewer)** → 보고서 저장 + 자동 수정. 메인은 등급/수정 요약만 수신.

## 8. 최종 점검

**Agent(verifier)** 가 전체 프로젝트 점검:

- 문서 존재/구조(15줄 헤더+L값)/코드-문서 정합성/테스트 커버리지/CI 완전성/Git 상태
- 미완료 항목 목록화 → 사용자에게 처리 방법 확인 (지금 처리 / 이슈 기록 / 무시)

## 9. 완료

- .claudeignore 초기화, 전체 문서 체크리스트 출력, 누락 알림
- Ralph 모드: Architect 검증 후 `/oh-my-claudecode:cancel`
