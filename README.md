# Docs OMC

개발 전 과정을 자동화하는 에이전트 시스템. 글로벌 규칙(Rules) + 프로젝트별 설정(CLAUDE.md) + Hook + Skill 조합으로 구성된다.

## 사전 요구사항

| 항목 | 설명 |
|------|------|
| Claude Code | CLI 또는 IDE 확장 설치 완료 |
| Node.js | v18+ (훅 스크립트 실행용) |
| Git | 버전 관리 |
| GitHub CLI | `gh` — PR 생성, 시크릿 관리 등 |

## 설치

```bash
git clone <docs-omc-repo>
cd docs-omc
node install.mjs  # 전역 설치
```

설치 내용:
1. OMC 플러그인 확인/설치
2. `~/.claude/rules/docs-omc.md` 배치
3. `~/.claude/hooks/docs-omc/*.mjs` 배치 + settings.json 훅 등록
4. 기본 스킬 확인 (find-skills, context7)
5. 커스텀 스킬 7개 설치 (`~/.agents/skills/`)

## 사용법

### 프로젝트 초기화

```
cd my-project && claude
/dev-init
```

### 전체 개발 Flow

```
/dev-init          → 개발 환경 초기화 (Git, CLAUDE.md, 스킬, GitHub 연동)
/docs-init plan    → 기획/설계 문서 템플릿 배치
/deep-interview    → 요구사항 수집
(기획/설계)         → STP, SRS/PRD, Architecture
/docs-init test    → 테스트 문서 템플릿 배치
/dev-team          → 문서 게이트 포함 자동 개발
/docs-init final   → 최종 문서 템플릿 배치
```

## 스킬 목록 (7개)

| 스킬 | 용도 |
|------|------|
| `/dev-init` | 프로젝트 개발 환경 초기화 (Git, CLAUDE.md, 스킬, GitHub 연동) |
| `/docs-init` | 단계별 문서 템플릿 배치 (plan/test/final/all) |
| `/dev-team` | 문서 게이트 포함 개발 Flow 오케스트레이션 |
| `/security-report` | 보안 점검 결과 저장 |
| `/test-report` | 테스트 결과 저장 |
| `/performance-report` | 성능 벤치마크 결과 저장 |
| `/architecture-doc` | Architecture 문서 생성 |

## 훅 목록 (5개)

| 훅 | 이벤트 | 동작 |
|----|--------|------|
| `session-start.mjs` | SessionStart | OMC + 스킬 + context7 존재 확인 |
| `pre-commit-check.mjs` | PreToolUse (Bash) | git commit 시 린트/포맷 검사 |
| `post-save-mmd.mjs` | PostToolUse (Write) | .mmd 파일 → PNG 변환 |
| `pre-compact.mjs` | PreCompact | compact 전 상태를 .claude/compact.md에 기록 |
| `post-compact.mjs` | PostCompact | compact 후 .claude/compact.md 읽고 작업 재개 |

## CI/CD (8 워크플로, 7 스크립트)

| 워크플로 | 용도 |
|----------|------|
| `docs-omc-ci.yml` | 메인 품질 게이트 (구문 검사, install 검증, 템플릿 무결성, 시크릿 스캔, 의존성 감사) |
| `ai-pr-review.yml` | PR diff 기반 룰 리뷰 (docs/dev/ 변경 감지 포함) |
| `ai-review-policy.yml` | AI blocker 키워드 탐지 + human 승인 강제 |
| `claude.yml` | `@claude` PR 멘션 시 코드 리뷰/수정 자동화 |
| `claude-code-review.yml` | PR 생성/동기화 시 Claude 자동 리뷰 |
| `codeql.yml` | JavaScript 정적 분석 (SAST) |
| `repo-governance.yml` | 브랜치 보호 + Merge Queue 자동 적용 (수동 실행) |
| `sbom.yml` | CycloneDX SBOM 생성 및 아티팩트 업로드 |

## PR 규칙

- PR 생성 시 `.github/pull_request_template.md` 템플릿 필수 사용
- 용도별로 PR을 분리한다 (관련 없는 변경을 섞지 않는다)
- merge/close된 PR에 push해도 master에 반영되지 않으므로, push 전 PR 상태를 확인한다

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
docs-omc/
├── install.mjs         # 통합 설치 (모든 OS)
├── scripts/
│   └── merge-hooks-config.mjs
├── rules/
│   ├── docs-omc.md
│   └── docs-omc-ref.md
├── hooks/
│   ├── session-start.mjs
│   ├── pre-commit-check.mjs
│   ├── post-save-mmd.mjs
│   ├── pre-compact.mjs
│   └── post-compact.mjs
├── skills/
│   ├── dev-init/          # 개발 환경 초기화 + GitHub 연동
│   ├── docs-init/         # 단계별 문서 템플릿 배치
│   ├── dev-team/
│   ├── security-report/
│   ├── test-report/
│   ├── performance-report/
│   └── architecture-doc/
├── .coderabbit.yaml    # CodeRabbit AI 리뷰 한국어 설정
├── .github/
│   ├── workflows/       # CI/CD (8 workflows)
│   ├── scripts/         # CI/CD 스크립트 (7 scripts)
│   ├── dependabot.yml   # 의존성 자동 업데이트
│   └── pull_request_template.md
└── README.md
```
