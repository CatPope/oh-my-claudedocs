---
name: dev-init
description: 프로젝트 초기화 — CLAUDE.md, docs/dev/ 템플릿 배치, 외부 스킬 설치, SRS/PRD 선택
argument-hint: "[project name]"
level: user
---

# Purpose

새 프로젝트에 Docs OMC 문서 체계를 세팅한다. CLAUDE.md 템플릿과 docs/dev/ 문서 템플릿을 배치하고, 필요한 외부 스킬을 탐색/설치하며, 프로젝트 규모에 따라 SRS 또는 PRD를 선택한다.

# Use When

- 새 프로젝트를 시작할 때
- 기존 프로젝트에 Docs OMC 문서 체계를 도입할 때
- 사용자가 `/dev-init`을 실행할 때

# Do Not Use When

- 이미 `/dev-init`이 완료된 프로젝트 (멱등성으로 누락분만 추가되긴 함)
- 문서 없이 빠르게 코드만 작성하고 싶을 때

# Steps

## 0. Git 확인

- `git status`로 Git 초기화 여부 확인
- Git이 없으면 `git init` + 초기 커밋 제안 (롤백 정책 전제조건)

## 1. CLAUDE.md 배치

- 프로젝트 루트에 `CLAUDE.md`가 없으면 `CLAUDE.md.template`를 복사
- 이미 존재하면 건너뜀 (멱등성)
- `<!-- DOCS-OMC-CONFIG-START -->` ~ `<!-- DOCS-OMC-CONFIG-END -->` 영역으로 OMC 설정과 분리

## 2. docs/dev/ 템플릿 배치

다음 템플릿을 `docs/dev/`에 복사한다. 이미 존재하는 파일은 건너뜀:

- `SRS.template.md` → `docs/dev/SRS.md` (규모에 따라)
- `PRD.template.md` → `docs/dev/PRD.md` (규모에 따라)
- `STP.template.md` → `docs/dev/STP.md`
- `GTM.template.md` → `docs/dev/GTM.md`
- `DetailedSpec.template.md` → `docs/dev/DetailedSpec.md`
- `Architecture.template.md` → `docs/dev/Architecture.md`
- `test-plan.template.md` → `docs/dev/test-plan.md`
- `db-schema.template.md` → `docs/dev/db-schema.md`
- `api-spec.template.md` → `docs/dev/api-spec.md`
- `env-guide.template.md` → `docs/dev/env-guide.md`
- `deploy-guide.template.md` → `docs/dev/deploy-guide.md`
- `limitations.template.md` → `docs/dev/limitations.md`
- `README.template.md` → `docs/dev/README.md`

빈 디렉토리도 생성:
- `docs/dev/test-results/`
- `docs/dev/performance/`
- `docs/dev/security-checklist/`
- `docs/dev/adr/`
- `.agent/` — 에이전트 상태 관리 디렉토리

`.agent/Note.md` 배치 (compact 시 상태 기록용)

## 3. 외부 스킬 탐색/설치

`find-skills`를 사용하여 다음 스킬을 탐색하고 설치한다:

| 스킬 | 용도 |
|------|------|
| `stp-framework` | STP 분석 |
| `gtm-strategy` | GTM 전략 |
| `architecture-decision-records` | ADR 문서 |
| `mermaid-cli` | .mmd → 이미지 변환 도구 |

이미 설치된 스킬은 건너뜀.

## 4. 프로젝트 규모 → SRS/PRD 선택

사용자에게 프로젝트 규모를 질문한다:

> 프로젝트 규모를 선택해 주세요:
> 1. **소규모** (사이드 프로젝트, MVP) → PRD 사용
> 2. **중/대규모** (팀, 엔터프라이즈) → SRS 사용

선택에 따라 해당 템플릿만 활성화한다.

## 5. 완료 안내

초기화 결과를 요약하고 다음 단계를 안내한다:
- `/deep-interview`로 요구사항 수집 시작을 제안
- 배치된 문서 목록 출력
- 설치된 스킬 목록 출력
