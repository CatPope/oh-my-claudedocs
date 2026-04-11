---
name: dev-autopilot
description: OMC autopilot 확장 — 문서 게이트(설계 승인, test-plan 승인) 포함 개발 Flow 오케스트레이션
level: user
---

# Purpose

OMC의 autopilot을 확장하여 Docs OMC 문서 체계의 게이트를 포함한 전체 개발 Flow를 오케스트레이션한다. 각 단계 전환 시 필수 문서의 존재/승인 여부를 확인한다.

# Use When

- 전체 개발 라이프사이클을 자동화하고 싶을 때
- 문서 기반 게이트를 포함한 체계적 개발이 필요할 때
- 사용자가 `/dev-autopilot`을 실행할 때

# Do Not Use When

- 단순 코드 수정이나 버그 픽스 → `/autopilot` 또는 직접 수정
- 문서 없이 빠르게 개발하고 싶을 때 → `/autopilot`
- 특정 단계만 실행하고 싶을 때 → 해당 스킬 직접 사용

# Steps

## 1. 사전 확인

- `/dev-init` 완료 여부 확인 (CLAUDE.md, docs/dev/ 존재)
- 미완료 시 `/dev-init` 실행을 제안

## 2. 기획 단계

1. 합의 언어 결정
2. 프로젝트 규모 확인 → SRS/PRD 선택 (이미 완료되었으면 건너뜀)
3. `/deep-interview` 실행 — 요구사항 수집
4. STP 작성 (`/stp-framework` 스킬 사용)
5. GTM 작성 (선택, 사용자 확인 후)
6. SRS 또는 PRD 작성 (deep-interview 결과 + 템플릿 목차 기반)
7. 개발 범위 확정 → 추가 스킬 자동 설치

## 3. 설계 단계

1. `/architecture-doc` 실행 — Architecture 문서 생성
2. DetailedSpec 작성 여부 확인 (사용자 선택)
   - YES → 목차 기반으로 작성
   - NO → 에이전트 판단 + ADR 기록
3. UI/UX 설계 (`designer` 에이전트 활용)

### ** 설계 승인 게이트 **

다음 항목을 CLAUDE.md에 기록 후 사용자 승인을 받아야 구현 단계로 진행:
- 속도 vs 보안 판단 결과 (에이전트 자동)
- 거버넌스 단계 (사용자 선택)
- Git 규칙 (사용자 동의)
- 코드 품질 기준 (사용자 동의)
- 기술 스택 확정 (사용자 선택)

> 사용자가 승인하지 않으면 구현 단계로 진행하지 않는다.

## 4. 구현 단계

- OMC autopilot의 Phase 2 (Execution) 실행
- Hook이 린트/포맷을 자동 실행 (pre-commit-check)
- Hook이 .mmd 파일을 자동 변환 (post-save-mmd)
- `debugger` 에이전트로 에러 처리
- `code-reviewer` 에이전트로 코드 리뷰

## 5. 테스트 단계

### ** test-plan 승인 게이트 **

1. `docs/dev/test-plan.md` 작성 → 사용자 승인 필수
2. 승인 전까지 테스트를 실행하지 않는다

### 승인 후 테스트 진행

3. `/test-report` 실행 — 테스트 결과 저장
4. `/performance-report` 실행 — 성능 벤치마크 저장
5. `/security-report` 실행 — 보안 점검 결과 저장

## 6. 개발 완료 후 (최종 정리)

완성된 코드를 기반으로 유지보수 문서를 작성:
- db-schema (DB 사용 시)
- api-spec (API 존재 시)
- env-guide
- deploy-guide
- limitations
- README

## 7. 완료

- 전체 문서 체크리스트 출력
- 누락 문서 알림
- 완료 요약
