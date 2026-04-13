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

```
/dev-team                 → 일반 team 모드
/dev-team ralph           → Ralph 영속 루프 + team 모드
/dev-team ralph "설명"    → 작업 설명 포함
```

# Auto-Ralph 설정

CLAUDE.md의 `<!-- DOCS-OMC-CONFIG-START -->` 영역에 다음 설정이 있으면,
`/dev-team` 실행 시 자동으로 ralph 모드가 활성화된다:

```markdown
<!-- DOCS-OMC-CONFIG-START -->
auto-ralph: true
<!-- DOCS-OMC-CONFIG-END -->
```

**동작 방식:**
1. `/dev-team` 실행 시 CLAUDE.md에서 `auto-ralph: true` 확인
2. 설정이 true이면 `/dev-team ralph`과 동일하게 동작
3. 명시적으로 `/dev-team ralph`을 입력한 경우에도 동일 (중복 적용 없음)

# Context 관리 원칙

**모든 문서 작성은 서브 에이전트에 위임한다.** 메인 에이전트(오케스트레이터)는 직접 문서를 작성하지 않는다.

- 서브 에이전트가 문서를 작성하고 파일로 저장
- 메인은 결과 요약(10줄 이내)만 수신
- 이전 단계 문서가 필요하면 서브 에이전트가 직접 읽음 (메인 context에 로드하지 않음)

```
메인 (오케스트레이터) — context 최소화
  ├─ Agent(writer) → SRS/PRD 작성 → 요약만 반환
  ├─ Agent(writer) → DetailedSpec 작성 → 요약만 반환
  ├─ Agent(writer) → test-plan 작성 → 요약만 반환
  └─ Agent(writer) → 최종 정리 문서 6종 → 요약만 반환
```

**단계 전환 시 .claudeignore 자동 갱신:**

| 단계 진입 | .claudeignore에 추가 |
|-----------|---------------------|
| 설계 단계 | `docs/dev/STP.md`, `docs/dev/GTM.md` |
| 구현 단계 | `docs/dev/SRS.md` 또는 `docs/dev/PRD.md`, `docs/dev/Architecture.md`, `docs/dev/DetailedSpec.md` |
| 테스트 단계 | (구현 코드만 필요, 설계 문서 유지 차단) |
| 최종 정리 | `docs/dev/test-plan.md`, `docs/dev/test-results/`, `docs/dev/performance/`, `docs/dev/security-checklist/` |

# Steps

## 0. Auto-Ralph 확인

1. CLAUDE.md에서 `<!-- DOCS-OMC-CONFIG-START -->` ~ `<!-- DOCS-OMC-CONFIG-END -->` 영역 파싱
2. `auto-ralph: true` 설정 확인
3. 설정이 true이거나 사용자가 `ralph` 인자를 전달한 경우 → Ralph 영속 루프 활성화

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
   - 에이전트에게 deep-interview 결과 파일 경로와 템플릿 경로를 전달
   - 에이전트가 직접 읽고 작성 후 파일 저장
   - 메인은 요약만 수신
7. 개발 범위 확정 → 추가 스킬 자동 설치

## 3. 설계 단계

> .claudeignore에 기획 문서 추가 (STP, GTM)

1. **Agent** → `/architecture-doc` 실행 — Architecture 문서 생성
2. DetailedSpec 작성 여부 확인 (사용자 선택)
   - YES → **Agent(writer)** → 목차 기반으로 작성, 요약만 반환
   - NO → **Agent(writer)** → ADR에 판단 근거 기록
3. **Agent(designer)** → UI/UX 설계

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

## 5. 테스트 단계

### ** test-plan 승인 게이트 **

1. **Agent(writer)** → `docs/dev/test-plan.md` 작성, 요약만 반환 → 사용자 승인 필수
2. 승인 전까지 테스트를 실행하지 않는다

### 승인 후 테스트 진행

3. **Agent** → `/test-report` 실행 — 테스트 결과 저장
4. **Agent** → `/performance-report` 실행 — 성능 벤치마크 저장
5. **Agent** → `/security-report` 실행 — 보안 점검 결과 저장

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

## 7. 완료

- .claudeignore 초기화 (모든 문서 다시 접근 가능)
- 전체 문서 체크리스트 출력
- 누락 문서 알림
- Ralph 모드인 경우 Architect 검증 후 `/oh-my-claudecode:cancel` 실행
- 완료 요약
