---
name: dev-init
description: 프로젝트 개발 환경 초기화 — Git, CLAUDE.md, 외부 스킬 설치, SRS/PRD 선택
argument-hint: "[project name]"
level: user
---

# Purpose

새 프로젝트에 Docs OMC 개발 환경을 세팅한다. CLAUDE.md 배치, 필요한 외부 스킬 탐색/설치, 프로젝트 규모에 따라 SRS 또는 PRD를 선택한다. 문서 템플릿 배치는 `/docs-init`으로 분리되어 있다.

# Use When

- 새 프로젝트를 시작할 때
- 기존 프로젝트에 Docs OMC를 도입할 때
- 사용자가 `/dev-init`을 실행할 때

# Do Not Use When

- 이미 `/dev-init`이 완료된 프로젝트 (멱등성으로 누락분만 추가되긴 함)
- 문서 없이 빠르게 코드만 작성하고 싶을 때

# Steps

## 0. Git 저장소 설정

- `git status`로 Git 초기화 여부 확인

### Git이 초기화되어 있는 경우

`git remote -v`로 원격 저장소를 확인한다:

- **원격 저장소가 있으면** → .gitignore를 확인하고 다음 단계로 진행
- **원격 저장소가 없으면** → 사용자에게 질문한다:

> Git은 초기화되어 있지만 원격 저장소(GitHub)가 연결되지 않았습니다.
> 1. **GitHub 원격 저장소 생성** — `gh repo create`로 연결 (권장)
> 2. **로컬 저장소만 유지** — 원격 없이 진행
>
> GitHub 저장소가 없으면 CI/CD, 브랜칭 전략 설정을 건너뜁니다.

선택에 따라:
- **1번**: `gh repo create <project-name> --private --source=. --push` 실행. public/private 여부도 확인
- **2번**: 다음 단계로 진행 (4~5단계 건너뜀)

### Git이 없는 경우

사용자에게 질문한다:

> Git 저장소를 설정합니다. 어떻게 진행할까요?
> 1. **GitHub 원격 저장소 생성** — `gh repo create`로 원격 + 로컬 동시 설정
> 2. **로컬 저장소만** — `git init`으로 로컬만 초기화
> 3. **건너뛰기** — Git 없이 진행 (롤백 기능 제한)

선택에 따라:
- **1번**: `gh repo create <project-name> --private --source=. --push` 실행. public/private 여부도 확인
- **2번**: `git init` + `.gitignore` 배치 + 초기 커밋
- **3번**: 경고 출력 후 다음 단계로 진행 (문서 롤백 불가 안내)

## 1. CLAUDE.md 배치

- 프로젝트 루트에 `CLAUDE.md`가 없으면 `CLAUDE.md.template`를 복사
- 이미 존재하면 건너뜀 (멱등성)
- `<!-- DOCS-OMC-CONFIG-START -->` ~ `<!-- DOCS-OMC-CONFIG-END -->` 영역으로 OMC 설정과 분리

### Placeholder 입력 시점

CLAUDE.md 템플릿의 `{{...}}` placeholder는 **입력 시점 열에 따라** 채운다. dev-init 시점이 아닌 항목은 placeholder를 그대로 남긴다.

| placeholder | 입력 시점 | 질문하는 단계 |
|-------------|-----------|---------------|
| `{{LANGUAGE}}` | dev-init | 이 단계 (1단계)에서 질문 |
| `{{COMMIT_CONVENTION}}` | dev-init | 이 단계 (1단계)에서 질문 |
| `{{DEFAULT_MODE}}` | dev-init | 이 단계 (1단계)에서 질문 |
| `{{BRANCH_STRATEGY}}` | dev-init | 4단계 (브랜칭 전략 선택)에서 자동 채움 |
| `{{SPEED_OR_SECURITY}}` | 인터뷰 | `/deep-interview` 시 에이전트 판단 → **지금 묻지 않는다** |
| `{{GOVERNANCE_LEVEL}}` | 인터뷰 | `/deep-interview` 시 질문 → **지금 묻지 않는다** |
| `{{COVERAGE_TARGET}}` | 인터뷰 | `/deep-interview` 시 질문 → **지금 묻지 않는다** |
| `{{COMPLEXITY_THRESHOLD}}` | 인터뷰 | `/deep-interview` 시 질문 → **지금 묻지 않는다** |
| `{{TECH_STACK}}` | 인터뷰 | `/deep-interview` 시 질문 → **지금 묻지 않는다** |

**중요:** `입력 시점`이 `인터뷰`인 항목을 dev-init에서 질문하지 않는다.

### 1단계 질문 흐름

다음 순서로 사용자에게 질문한다:

1. **합의 언어** → `{{LANGUAGE}}`
   > 문서 작성 언어를 선택해 주세요: 한국어 / English / 기타

2. **커밋 컨벤션** → `{{COMMIT_CONVENTION}}`
   > 커밋 메시지 컨벤션을 선택해 주세요:
   > 1. **Conventional Commits** — `feat(scope): subject` 형식 (권장)
   > 2. **자유 형식** — 별도 규칙 없음
   > 3. **직접 입력** — 팀 컨벤션 명시

3. **기본 실행 모드** → `{{DEFAULT_MODE}}`
   > `/dev-team` 실행 시 기본 모드를 선택해 주세요:
   > 1. **dev-team ralph** — 완료까지 자동 반복, 검증 후 종료 (권장)
   > 2. **dev-team** — 일반 팀 모드, 단계별 수동 진행
   > 3. **직접 입력** — 예: autopilot, team ralph 등
   >
   > ralph 모드는 모든 작업이 완료·검증될 때까지 자동으로 재시도합니다. 장시간 자율 실행이 가능한 환경에서 권장합니다.

## 2. 외부 스킬 탐색/설치

`find-skills`를 사용하여 다음 스킬을 탐색하고 설치한다:

| 스킬 | 용도 |
|------|------|
| `stp-framework` | STP 분석 |
| `gtm-strategy` | GTM 전략 |
| `architecture-decision-records` | ADR 문서 |
| `mermaid-cli` | .mmd → 이미지 변환 도구 |

이미 설치된 스킬은 건너뜀.

## 3. 프로젝트 규모 → SRS/PRD 선택

사용자에게 프로젝트 규모를 질문한다:

> 프로젝트 규모를 선택해 주세요:
> 1. **소규모** (사이드 프로젝트, MVP) → PRD 사용
> 2. **중/대규모** (팀, 엔터프라이즈) → SRS 사용

선택 결과를 CLAUDE.md에 기록한다.

## 4. 브랜칭 전략 선택

GitHub 저장소가 설정된 경우 (0단계에서 1번 또는 기존 Git 원격이 있는 경우), 브랜칭 전략을 질문한다:

> 브랜칭 전략을 선택해 주세요:
> 1. **GitHub Flow** — main + feature 브랜치, PR 머지 = 배포 (소~중규모, 지속 배포)
> 2. **Git Flow** — main/develop/feature/release/hotfix (릴리스 주기가 긴 대규모 팀)
> 3. **Trunk-Based** — main 직접 커밋, 피처 플래그 (CI/CD 성숙한 팀, 빠른 반복)

선택 결과를 CLAUDE.md에 기록한다.

## 5. GitHub CI 배치

4단계에서 선택한 브랜칭 전략에 따라 CI 워크플로우의 트리거 브랜치를 조정하여 배치한다:

| 전략 | CI 트리거 (push) | CI 트리거 (pull_request) |
|------|------------------|--------------------------|
| **GitHub Flow** | `[main, master]` | `[main, master]` |
| **Git Flow** | `[main, master, develop, 'release/**']` | `[main, master, develop]` |
| **Trunk-Based** | `[main, master]` | `[main, master]` |

배치 파일:

1. `.github/workflows/docs-omc-ci.yml` — 문서 구조 검증, 시크릿 스캔, 의존성 감사
2. `.github/scripts/validate-docs-structure.mjs` — docs/dev/ 15줄 헤더 + L값 목차 검증
3. `.github/scripts/scan-secrets.mjs` — API 키/시크릿 유출 방지
4. `.github/scripts/check-dependency-audit.mjs` — npm 취약점 검사
5. `.github/pull_request_template.md` — PR 체크리스트 템플릿

이미 존재하는 파일은 건너뜀 (멱등성).
워크플로우 배치 시 템플릿의 `on.push.branches`와 `on.pull_request.branches`를 위 표에 따라 치환한다.

> GitHub 저장소가 아닌 경우 (로컬 전용 또는 Git 없음) 4~5단계를 건너뛴다.

## 6. 완료 안내

초기화 결과를 요약하고 다음 단계를 안내한다:

- 설치된 스킬 목록 출력
- 다음 단계 안내:

> **다음 단계:**
> - `/dev-team` — 기획부터 배포까지 전체 개발 Flow를 자동 오케스트레이션 (권장)
> - `/docs-init plan` — 기획/설계 문서 템플릿만 먼저 배치
> - `/deep-interview` — 요구사항 수집 인터뷰만 단독 실행
>
> `/dev-team`은 문서 작성, 설계, 구현, 테스트, 최종 정리까지 단계별 게이트와 서브 에이전트 위임을 포함한 전체 워크플로우를 실행합니다.
>
> `/docs-init` 명령어로 단계별 문서 템플릿을 개별 배치할 수도 있습니다:
> - `/docs-init plan` — 기획/설계 문서
> - `/docs-init test` — 테스트 문서
> - `/docs-init final` — 최종 문서
> - `/docs-init all` — 전체 문서
