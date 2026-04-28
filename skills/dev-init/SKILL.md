---
name: dev-init
description: 프로젝트 개발 환경 초기화 — Git, CLAUDE.md, 외부 스킬 설치, SRS/PRD 선택
argument-hint: "[project name]"
level: user
---

# Purpose

새 프로젝트에 Docs OMC 개발 환경을 세팅한다. CLAUDE.md 배치, 외부 스킬 설치, SRS/PRD 선택. 문서 템플릿 배치는 `/docs-init`으로 분리.

# Use When

- 새 프로젝트 시작 또는 기존 프로젝트에 Docs OMC 도입 시

# Steps

## 0. Git 저장소 설정

`git status`로 확인 후 분기:

### Git 초기화됨

`git remote -v`로 원격 저장소 확인:
- **원격 있으면** → .gitignore 확인 후 다음 단계
- **원격 없으면** → 사용자에게 질문: 1) GitHub 생성 (`gh repo create`) 2) 로컬만 유지 (4~5단계 건너뜀)

### Git 없음

사용자에게 질문: 1) GitHub 생성 (`gh repo create`) 2) 로컬만 (`git init`) 3) 건너뛰기 (롤백 제한 안내)

## 1. CLAUDE.md 배치

없으면 `CLAUDE.md.template` 복사. 이미 있으면 건너뜀.

### Placeholder 입력 시점

| placeholder | 입력 시점 |
|-------------|-----------|
| `{{LANGUAGE}}`, `{{COMMIT_CONVENTION}}`, `{{DEFAULT_MODE}}` | **dev-init** (이 단계에서 질문) |
| `{{BRANCH_STRATEGY}}` | 4단계 (브랜칭 전략 선택 시 자동) |
| `{{SPEED_OR_SECURITY}}`, `{{GOVERNANCE_LEVEL}}`, `{{COVERAGE_TARGET}}`, `{{COMPLEXITY_THRESHOLD}}`, `{{TECH_STACK}}`, `{{DELIVERABLE}}` | **인터뷰** (`/deep-interview` 시 — 지금 묻지 않는다) |

### 1단계 질문 흐름

1. **합의 언어** → `{{LANGUAGE}}` (한국어/English/기타)
2. **커밋 컨벤션** → `{{COMMIT_CONVENTION}}` (Conventional Commits/자유 형식/직접 입력)
3. **기본 실행 모드** → `{{DEFAULT_MODE}}` (dev-team ralph/dev-team/직접 입력)

## 2. 외부 스킬 탐색/설치

`find-skills`로 탐색: stp-framework, gtm-strategy, architecture-decision-records, mermaid-cli. 이미 설치된 건 건너뜀.

## 3. 프로젝트 규모 → SRS/PRD 선택

소규모(MVP) → PRD / 중대규모(팀) → SRS. 선택 결과를 CLAUDE.md에 기록.

## 4. 브랜칭 전략 선택 (GitHub 설정 시만)

| 전략 | CI push 트리거 | CI PR 트리거 |
|------|---------------|--------------|
| GitHub Flow | `[main, master]` | `[main, master]` |
| Git Flow | `[main, master, develop, 'release/**']` | `[main, master, develop]` |
| Trunk-Based | `[main, master]` | `[main, master]` |

## 5. GitHub CI 배치 (GitHub 설정 시만)

4단계 선택에 따라 트리거 치환하여 배치:
- `.github/workflows/docs-omc-ci.yml`, `.github/scripts/`(validate-docs-structure, scan-secrets, check-dependency-audit), `.github/pull_request_template.md`

이미 존재하는 파일은 건너뜀.

## 6. 완료 안내

초기화 결과 요약 + 다음 단계 안내:
- `/dev-team` — 전체 개발 Flow 오케스트레이션 (권장)
- `/docs-init plan` — 기획/설계 문서 템플릿만 배치
- `/deep-interview` — 요구사항 수집 단독 실행
