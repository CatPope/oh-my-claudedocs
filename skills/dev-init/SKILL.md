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

## 0. Git 확인

- `git status`로 Git 초기화 여부 확인
- Git이 없으면 `git init` + 초기 커밋 제안 (롤백 정책 전제조건)

## 1. CLAUDE.md 배치

- 프로젝트 루트에 `CLAUDE.md`가 없으면 `CLAUDE.md.template`를 복사
- 이미 존재하면 건너뜀 (멱등성)
- `<!-- DOCS-OMC-CONFIG-START -->` ~ `<!-- DOCS-OMC-CONFIG-END -->` 영역으로 OMC 설정과 분리

## 2. .claude/compact.md 배치

- `.claude/compact.md` 배치 (compact 시 상태 기록용)
- `.claude/` 디렉토리는 Claude Code가 자동 생성

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

선택 결과를 CLAUDE.md에 기록한다.

## 5. 완료 안내

초기화 결과를 요약하고 다음 단계를 안내한다:

- **다음 단계**: `/docs-init plan`으로 기획/설계 문서 템플릿을 배치하세요
- `/deep-interview`로 요구사항 수집 시작을 제안
- 설치된 스킬 목록 출력

> `/docs-init` 명령어로 단계별 문서 템플릿을 배치할 수 있습니다:
> - `/docs-init plan` — 기획/설계 문서
> - `/docs-init test` — 테스트 문서
> - `/docs-init final` — 최종 문서
> - `/docs-init all` — 전체 문서
