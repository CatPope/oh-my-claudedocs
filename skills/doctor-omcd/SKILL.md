---
name: doctor-omcd
description: Docs OMC 설치 상태 진단 — 스킬, 훅, 규칙, MCP, 플러그인, 프로젝트 설정 점검
argument-hint: ""
level: user
---

# Purpose

Docs OMC의 전역 설치 및 프로젝트 설정 상태를 진단한다. 문제 발견 시 원인과 해결 방법을 안내한다.

# Use When

- Docs OMC 설치 후 정상 동작 여부를 확인할 때
- 스킬/훅/규칙이 동작하지 않을 때
- 사용자가 `/doctor-omcd`를 실행할 때

# Do Not Use When

- 초기 설치가 필요할 때 → `node install.mjs` 사용
- 프로젝트 초기화가 필요할 때 → `/dev-init` 사용

# Steps

## 1. 전역 설치 점검

### 1-1. OMC 플러그인

```bash
claude plugin list
```

- `oh-my-claudecode` 존재 + `enabled` → ✓
- 존재 + `disabled` → ⚠ `claude plugin enable oh-my-claudecode@omc` 실행 안내
- 미설치 → ✗ `claude plugin add oh-my-claudecode@omc` 실행 안내

### 1-2. 스킬 설치

`~/.claude/skills/`에서 다음 스킬의 `SKILL.md` 존재 여부를 확인한다:

| 스킬 | 출처 |
|------|------|
| `dev-init` | Docs OMC |
| `docs-init` | Docs OMC |
| `dev-team` | Docs OMC |
| `doctor-omcd` | Docs OMC |
| `security-report` | Docs OMC |
| `test-report` | Docs OMC |
| `performance-report` | Docs OMC |
| `architecture-doc` | Docs OMC |
| `find-skills` | OMC 플러그인 |

- 파일 존재 → ✓
- 파일 없음 → ✗ `node install.mjs` 재실행 안내 (find-skills는 OMC 플러그인 확인)

### 1-3. 훅 설치

`~/.claude/hooks/docs-omc/`에서 다음 파일 존재 여부를 확인한다:

- `session-start.mjs`
- `pre-commit-check.mjs`
- `post-save-mmd.mjs`
- `pre-compact.mjs`
- `post-compact.mjs`

파일 존재 확인 후, `~/.claude/settings.json`에 훅이 등록되어 있는지도 확인한다.

- 파일 + 등록 → ✓
- 파일만 있고 미등록 → ⚠ `node scripts/merge-hooks-config.mjs` 실행 안내
- 파일 없음 → ✗ `node install.mjs` 재실행 안내

### 1-4. 규칙 파일

`~/.claude/rules/`에서 다음 파일 존재 여부를 확인한다:

- `docs-omc.md`
- `docs-omc-ref.md`

- 존재 → ✓
- 없음 → ✗ `node install.mjs` 재실행 안내

### 1-5. context7 MCP

전역(`~/.claude.json`의 `mcpServers.context7`) → 로컬(`.mcp.json`의 `mcpServers.context7`) 순서로 확인한다.

- 전역 또는 로컬에 등록 → ✓
- 미등록 → ⚠ `https://context7.com/` 에서 토큰 발급 후 `/dev-init`에서 설정 안내

## 2. 프로젝트 설정 점검

프로젝트 디렉토리(현재 작업 디렉토리)에서 확인한다. Git 저장소가 아니면 이 섹션을 건너뛴다.

### 2-1. Git 상태

- `git status` 실행 가능 → ✓
- Git 미초기화 → ⚠ `/dev-init` 실행 안내

### 2-2. CLAUDE.md

- 프로젝트 루트에 존재 → ✓
- 없음 → ⚠ `/dev-init` 실행 안내
- 존재하면 `<!-- DOCS-OMC-CONFIG-START -->` 영역 존재 여부도 확인

### 2-3. .claude/ 디렉토리

다음 파일 존재 여부를 확인한다:

- `.claude/compact.md` — compact 시 상태 기록용
- `.claude/docs-map.md` — 기존 문서 매핑 관리용
- `.claude/settings.json` — 프로젝트 가드레일

각 파일:
- 존재 → ✓
- 없음 → ⚠ `/dev-init` 실행 안내

### 2-4. docs/dev/ 구조

`/docs-init`으로 배치된 문서 존재 여부를 확인한다:

- `docs/dev/` 디렉토리 존재 여부
- 존재하면 어떤 문서가 있는지 목록 출력
- 없으면 → 정보: `/docs-init`으로 문서 템플릿 배치 가능

## 3. 결과 출력

진단 결과를 요약한다:

```
=== Docs OMC 진단 결과 ===

[전역 설치]
  ✓ OMC 플러그인 (v4.11.2, enabled)
  ✓ 스킬 8/8 설치됨
  ✓ 훅 5/5 설치 + 등록됨
  ✓ 규칙 2/2 배치됨
  ⚠ context7 MCP 미설정

[프로젝트 설정]
  ✓ Git 초기화됨
  ✓ CLAUDE.md (OMC 설정 포함)
  ✓ .claude/compact.md
  ⚠ .claude/docs-map.md 없음
  ⚠ .claude/settings.json 없음
  ✓ docs/dev/ (SRS.md, Architecture.md)

[요약]
  ✓ 정상: 13개
  ⚠ 경고: 3개
  ✗ 오류: 0개
```

## 4. 자동 수정 제안

오류(✗) 또는 경고(⚠) 항목이 있으면 사용자에게 수정 방법을 안내한다:

> 3개의 경고가 발견되었습니다. 자동으로 수정할까요?
> 1. context7 MCP 설정 → 토큰 필요
> 2. .claude/docs-map.md 생성 → 즉시 가능
> 3. .claude/settings.json 생성 → `/dev-init` 실행 필요

- 즉시 수정 가능한 항목은 사용자 승인 후 직접 수정한다
- 외부 작업이 필요한 항목(토큰 발급 등)은 안내만 한다
