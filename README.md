# oh-my-claudedocs

개발 전 과정을 자동화하는 에이전트 시스템. 프로젝트별 규칙(Rules) + 설정(CLAUDE.md) + Hook(하네스) + Skill 조합으로 구성된다.

## 사전 요구사항

| 항목 | 설명 |
|------|------|
| Claude Code | CLI 또는 IDE 확장 설치 완료 |
| Node.js | v18+ (훅 스크립트 실행용) |
| Git | 버전 관리 |

## 설치

다음 명령어로 설치한다:

```bash
git clone <oh-my-claudedocs-repo>
cd oh-my-claudedocs
node install.mjs #변경사항 전역으로 적용
```

설치 내용:
1. OMC 플러그인 확인/설치
2. `~/.claude/hooks/omcd/*.mjs` 배치 + settings.json 훅 등록
3. 기본 스킬 확인 (find-skills, context7)
4. 커스텀 스킬 7개 설치 (`~/.agents/skills/`)

> **Note**: Rules(`omcd.md`, `omcd-ref.md`)는 글로벌 설치하지 않습니다. `/dev-init` 시 프로젝트별 `.claude/rules/`에 배치됩니다.

## 사용법

### 프로젝트 초기화

```
cd my-project && claude
/dev-init
```

### 전체 개발 Flow

```
/dev-init          → 개발 환경 초기화 (Git, CLAUDE.md, Rules, claude_temp/, 스킬)
/docs-init plan    → 기획/설계 문서 템플릿 배치
/deep-interview    → 요구사항 수집
(기획/설계)         → STP, SRS/PRD, Architecture
/docs-init test    → 테스트 문서 템플릿 배치
/dev-team          → 문서 게이트 포함 자동 개발
/docs-init final   → 최종 문서 템플릿 배치
```

## 스킬 목록

| 스킬 | 용도 |
|------|------|
| `/dev-init` | 프로젝트 개발 환경 초기화 (Git, CLAUDE.md, Rules, 스킬 설치) |
| `/docs-init` | 단계별 문서 템플릿 배치 (plan/test/final/all) |
| `/dev-team` | 문서 게이트 포함 개발 Flow 오케스트레이션 |
| `/security-report` | 보안 점검 결과 저장 |
| `/test-report` | 테스트 결과 저장 |
| `/performance-report` | 성능 벤치마크 결과 저장 |
| `/architecture-doc` | Architecture 문서 생성 |
| `/doctor-omcd` | 설치 상태 진단 |

## 훅 목록 (하네스)

### 기존 훅

| 훅 | 이벤트 | 동작 |
|----|--------|------|
| `session-start.mjs` | SessionStart | OMC + 스킬 존재 확인 |
| `pre-commit-check.mjs` | PreToolUse (Bash) | git commit 시 린트/포맷 검사 |
| `post-save-mmd.mjs` | PostToolUse (Write) | .mmd 파일 → PNG 변환 |
| `pre-compact.mjs` | PreCompact | compact 전 상태를 .claude/compact.md에 기록 |
| `post-compact.mjs` | PostCompact | compact 후 .claude/compact.md 읽고 작업 재개 |

### 하네스 훅 (자동 강제)

| 훅 | 이벤트 | 동작 | 강제력 |
|----|--------|------|--------|
| `claude-md-limit.mjs` | PreToolUse (Write\|Edit) | CLAUDE.md 300줄 초과 시 저장 차단 | **deny** |
| `conventional-commit.mjs` | PreToolUse (Bash) | Conventional Commits 형식 위반 시 커밋 차단 | **deny** |
| `pr-push-check.mjs` | PreToolUse (Bash) | push 전 열린 PR 존재·타이틀 확인 | systemMessage |
| `docs-header-check.mjs` | PostToolUse (Write\|Edit) | docs 15줄 헤더 + L값 목차 정합성 검증 | systemMessage |

> **하네스 vs 규칙**: 하네스 훅은 코드로 자동 강제되므로 Rules 파일에 중복 기술할 필요 없이 컨텍스트를 절약한다.

## 스크립트 우선 실행 원칙

Claude는 가능한 모든 작업을 직접 수행하지 않고, **스크립트를 `claude_temp/`에 작성 → 실행**한다.

- `/dev-init` 시 `claude_temp/` 디렉토리 자동 생성 (`.gitignore` 등록)
- 단순 1줄 명령(예: `git status`)은 예외로 직접 실행 가능

### 사전 배치 유틸

| 스크립트 | 용도 |
|----------|------|
| `check-cascade.mjs` | 변경 파일 기반 연쇄 갱신 대상 확인 |
| `check-doc-status.mjs` | 필수/선택 문서 존재 여부 + 날짜 파일명 검증 |
| `check-all-doc-headers.mjs` | 전체 docs/ 15줄 헤더 + L값 목차 배치 검증 |

## CI/CD

GitHub Actions 워크플로 (6개):

| 워크플로 | 용도 |
|----------|------|
| `omcd-ci.yml` | 메인 품질 게이트 (구문 검사, install 검증, 템플릿 무결성, 시크릿 스캔, 의존성 감사) |
| `ai-pr-review.yml` | PR diff 기반 룰 리뷰 (docs/dev/ 변경 감지 포함) |
| `ai-review-policy.yml` | AI blocker 키워드 탐지 + human 승인 강제 |
| `codeql.yml` | JavaScript 정적 분석 (SAST) |
| `repo-governance.yml` | 브랜치 보호 + Merge Queue 자동 적용 (수동 실행) |
| `sbom.yml` | CycloneDX SBOM 생성 및 아티팩트 업로드 |

## 문서 분류 체계

| 분류 | 문서 |
|------|------|
| 논의 (필수) | SRS/PRD, STP, test-plan |
| 논의 (선택) | GTM |
| 선택 | DetailedSpec |
| 필수 (자동) | Architecture, 테스트 결과, 성능 벤치마크, 보안 체크리스트 |
| 필수 (최종) | db-schema, api-spec, env-guide, deploy-guide, limitations, README |
| 상시 | ADR |

## 거버넌스 3단계

| 단계 | 대상 |
|------|------|
| 경량 | 개인/사이드 프로젝트 |
| 표준 | 팀/스타트업 (기본값) |
| 엄격 | 엔터프라이즈/규제 산업 |

## 저장소 구조

```
oh-my-claudedocs/
├── install.mjs         # 통합 설치 (모든 OS)
├── scripts/
│   └── merge-hooks-config.mjs
├── rules/
│   ├── omcd.md         # 프로젝트별 규칙 (원본)
│   └── omcd-ref.md     # 상세 참조 (원본)
├── hooks/
│   ├── session-start.mjs
│   ├── pre-commit-check.mjs
│   ├── post-save-mmd.mjs
│   ├── pre-compact.mjs
│   ├── post-compact.mjs
│   ├── claude-md-limit.mjs      # 하네스: CLAUDE.md 300줄 제한
│   ├── conventional-commit.mjs  # 하네스: Conventional Commits
│   ├── pr-push-check.mjs        # 하네스: push 전 PR 확인
│   └── docs-header-check.mjs    # 하네스: docs 헤더 검증
├── skills/
│   ├── dev-init/          # 개발 환경 초기화
│   │   └── templates/
│   │       ├── .claude/rules/     # omcd*.md 프로젝트별 배치용
│   │       └── claude_temp/       # 사전 배치 유틸 스크립트
│   ├── docs-init/         # 단계별 문서 템플릿 배치
│   ├── dev-team/
│   ├── doctor-omcd/       # 설치 상태 진단
│   ├── security-report/
│   ├── test-report/
│   ├── performance-report/
│   └── architecture-doc/
├── .coderabbit.yaml    # CodeRabbit AI 리뷰 한국어 설정
├── .github/
│   ├── workflows/       # CI/CD (6 workflows)
│   ├── scripts/         # CI/CD 스크립트 (7 scripts)
│   ├── dependabot.yml   # 의존성 자동 업데이트
│   └── pull_request_template.md
└── README.md
```
