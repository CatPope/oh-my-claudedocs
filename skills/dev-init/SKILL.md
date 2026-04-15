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

## 0. 권한 설정 (Guardrails)

### A. 프로젝트 가드레일 (`.claude/settings.json`)

`.claude/settings.json`이 없으면 생성한다. 이미 존재하면 `permissions` 키만 병합한다.
이 파일은 **Git에 커밋**되어 팀 전체에 적용된다.

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npm test *)",
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git checkout *)",
      "Bash(git branch *)",
      "Bash(node -c *)",
      "Bash(node install.mjs)",
      "Edit(.claude/compact.md)",
      "Write(.claude/compact.md)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Bash(git reset --hard *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

> **원칙**: 최소 권한(least-privilege). 안전한 명령만 allow, 위험 명령은 deny.
> deny는 상위 설정이 우선이므로, 개인이 allow해도 풀리지 않는다.

### B. 개인 자동 승인 (`.claude/settings.local.json`)

사용자에게 권한 자동 승인 여부를 질문한다:

> dev-init 과정에서 파일 생성, 명령 실행 등 다양한 권한 요청이 발생합니다.
> 모든 요청을 자동 승인하시겠습니까?
> 1. **예** — 자동 승인 모드
> 2. **아니오** — 매번 수동 확인 (기본값)

**"예" 선택 시:**

`.claude/settings.local.json`에 다음을 작성한다 (gitignore 대상):

```json
{
  "permissions": {
    "allow": [
      "Bash(*)",
      "Read(*)",
      "Edit(*)",
      "Write(*)",
      "Glob(*)",
      "Grep(*)",
      "Agent(*)",
      "WebFetch(*)",
      "WebSearch(*)",
      "mcp__*"
    ]
  }
}
```

> 프로젝트 `settings.json`의 deny 규칙은 여전히 적용됩니다.

작성 후 사용자에게 안내한다:

> 자동 승인 설정이 완료되었습니다. **Claude Code를 재시작**하면 적용됩니다.
> 지금 재시작하시겠습니까? (재시작 후 `/dev-init` 다시 실행)

- 재시작을 원하면 세션 종료를 안내한다.
- 재시작 없이 계속하려면 다음 단계로 진행한다 (매번 수동 확인).

**"아니오" 선택 시:** 다음 단계로 진행한다.

## 1. Git 확인

- `git status`로 Git 초기화 여부 확인
- Git이 없으면 `git init` + 초기 커밋 제안 (롤백 정책 전제조건)

## 2. CLAUDE.md 배치

- 프로젝트 루트에 `CLAUDE.md`가 없으면 `CLAUDE.md.template`를 복사
- 이미 존재하면 건너뜀 (멱등성)
- `<!-- DOCS-OMC-CONFIG-START -->` ~ `<!-- DOCS-OMC-CONFIG-END -->` 영역으로 OMC 설정과 분리

## 3. .claude/ 파일 배치

- `.claude/compact.md` 배치 (compact 시 상태 기록용)
- `.claude/docs-map.md` 배치 (기존 문서 매핑 관리용)
- `.claude/` 디렉토리는 Claude Code가 자동 생성

## 4. 외부 스킬 탐색/설치

`find-skills`를 사용하여 다음 스킬을 탐색하고 설치한다:

| 스킬 | 용도 |
|------|------|
| `stp-framework` | STP 분석 |
| `gtm-strategy` | GTM 전략 |
| `architecture-decision-records` | ADR 문서 |
| `mermaid-cli` | .mmd → 이미지 변환 도구 |

이미 설치된 스킬은 건너뜀.

## 5. 기존 문서 스캔

프로젝트에 이미 존재하는 문서 파일(`.md`, `.docx`, `.pdf`, `.hwp` 등)을 탐색한다.
`node_modules/`, `.git/`, `dist/` 등 빌드/의존성 디렉토리는 제외한다.

문서가 발견되면 각 파일에 대해 사용자에게 질문한다:

> `docs/PRD_v2.md` 파일을 발견했습니다.
> 1. **개발 문서로 사용** — Docs OMC 워크플로에 연동
> 2. **참고 자료** — context로만 활용
> 3. **건너뛰기** — 관련 없는 파일

### "개발 문서로 사용" 선택 시

OMC 문서 유형에 매핑한다:

> 이 문서의 유형을 선택해 주세요:
> 1. SRS (소프트웨어 요구사항 명세)
> 2. PRD (제품 요구사항 문서)
> 3. STP (시장 분석)
> 4. GTM (출시 전략)
> 5. Architecture (아키텍처)
> 6. DetailedSpec (상세 설계)
> 7. test-plan (테스트 계획)
> 8. 기타 (직접 입력)

매핑 후 원본 내용을 기반으로 OMC 형식의 새 파일을 작성한다:
- 원본을 읽고 내용을 OMC 15줄 헤더 + L값 목차 형식으로 변환하여 새 파일 생성
- 예: `요구사항서.pdf` → 내용을 읽어 `docs/dev/PRD.md`로 새로 작성
- 원본 파일은 `.claudeignore`에 추가하여 context 오염을 방지한다
- `.claude/docs-map.md`에 매핑 기록을 추가한다
- `/docs-init` 실행 시 해당 경로에 파일이 이미 존재하므로 템플릿 배치를 건너뜀 (멱등성)

### "참고 자료" 선택 시

원본 파일은 `.claudeignore`에 추가하고, `.claude/docs-map.md`에 참고 자료로 기록한다.

### "건너뛰기" 선택 시

건너뜀.

### `.claude/docs-map.md`

기존 문서의 매핑 및 참고 자료 정보를 관리한다. `.claudeignore`에 추가된 파일도 이 파일을 통해 원본 위치와 용도를 파악할 수 있다.

```markdown
# 문서 매핑

## 개발 문서
| 원본 | OMC 문서 | 유형 |
|------|----------|------|
| docs/요구사항서.pdf | docs/dev/PRD.md | PRD |

## 참고 자료
| 파일 | 설명 |
|------|------|
| docs/경쟁사분석.pdf | 시장 조사 참고 |
```

## 6. 프로젝트 규모 → SRS/PRD 선택

Step 5에서 SRS 또는 PRD가 이미 매핑되었으면 이 단계를 건너뛴다.

매핑되지 않은 경우, 사용자에게 프로젝트 규모를 질문한다:

> 프로젝트 규모를 선택해 주세요:
> 1. **소규모** (사이드 프로젝트, MVP) → PRD 사용
> 2. **중/대규모** (팀, 엔터프라이즈) → SRS 사용

선택 결과를 CLAUDE.md에 기록한다.

## 7. 완료 안내

초기화 결과를 요약하고 다음 단계를 안내한다:

- **다음 단계**: `/docs-init plan`으로 기획/설계 문서 템플릿을 배치하세요
- `/deep-interview`로 요구사항 수집 시작을 제안
- 설치된 스킬 목록 출력
- 기존 문서에서 매핑/참고 자료로 등록된 파일 목록

> `/docs-init` 명령어로 단계별 문서 템플릿을 배치할 수 있습니다:
> - `/docs-init plan` — 기획/설계 문서
> - `/docs-init test` — 테스트 문서
> - `/docs-init final` — 최종 문서
> - `/docs-init all` — 전체 문서
