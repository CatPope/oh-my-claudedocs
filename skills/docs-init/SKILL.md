---
name: docs-init
description: 단계별 문서 템플릿 배치 — plan(기획/설계), test(테스트), final(최종), all(전체)
argument-hint: "plan | test | final | all"
level: user
---

# Purpose

Docs OMC 문서 템플릿을 단계별로 배치한다.

# Use When

- `/dev-init` 완료 후 문서 템플릿을 배치할 때
- 개발 단계 전환 시 해당 단계 문서가 필요할 때

# Arguments

| 인자 | 배치 문서 |
|------|----------|
| `plan` (기본값) | SRS/PRD, STP, GTM, Architecture, DetailedSpec, adr/ |
| `test` | test-plan, test-results/, performance/, security-checklist/, review/ |
| `final` | db-schema, api-spec, env-guide, deploy-guide, limitations, README |
| `all` | plan + test + final |

# Steps

## 0. 선행 조건

CLAUDE.md 존재 확인. 없으면 `/dev-init` 안내 후 중단.

## 1. 초기화 확인

기존 문서 발견 시 사용자에게 질문:
1. **기존 유지** — 없는 파일만 배치 (멱등)
2. **전부 덮어쓰기** — 템플릿으로 초기화
3. **선택 초기화** — 사용자가 선택한 파일만 덮어씀

기존 문서 없으면 바로 배치.

## 2. 템플릿 배치

`skills/dev-init/templates/docs/dev/`에서 해당 단계 템플릿을 `docs/dev/`로 복사.

### plan

`*.template.md` → `docs/dev/`: SRS 또는 PRD (CLAUDE.md 선택 따라), STP, GTM, Architecture, DetailedSpec + `docs/dev/adr/`

### test

`test-plan.template.md` → `docs/dev/test-plan.md` + 디렉토리: test-results/, performance/, security-checklist/, review/

**배치 후**: 사용자 동의 시 **Agent(test-engineer)** 가 코드베이스+기존 문서 기반으로 test-plan 자동 작성.

### final

`*.template.md` → `docs/dev/`: db-schema, api-spec, env-guide, deploy-guide, limitations, README

## 3. 완료 안내

배치/건너뛴 파일 목록 + 다음 단계 안내.
