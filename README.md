# Docs OMC

개발 전 과정을 자동화하는 에이전트 시스템. 글로벌 규칙(Rules) + 프로젝트별 설정(CLAUDE.md) + Hook + Skill 조합으로 구성된다.

## 사전 요구사항

| 항목 | 설명 |
|------|------|
| Claude Code | CLI 또는 IDE 확장 설치 완료 |
| Node.js | v18+ (훅 스크립트 실행용) |
| Git | 버전 관리 |

## 설치

OS에 맞는 스크립트를 실행한다:

**macOS / Linux (bash)**
```bash
git clone <docs-omc-repo>
cd docs-omc
bash install.sh
```

**Windows (PowerShell)**
```powershell
git clone <docs-omc-repo>
cd docs-omc
.\install.ps1
```

> PowerShell 실행 정책 오류 시: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

**Windows (CMD)**
```cmd
git clone <docs-omc-repo>
cd docs-omc
install.cmd
```

설치 내용:
1. OMC 플러그인 확인/설치
2. `~/.claude/rules/docs-omc.md` 배치
3. `~/.claude/hooks/docs-omc/*.mjs` 배치 + settings.json 훅 등록
4. 기본 스킬 확인 (find-skills, context7)
5. 커스텀 스킬 6개 설치 (`~/.agents/skills/`)

## 사용법

### 프로젝트 초기화

```
cd my-project && claude
/dev-init
```

### 전체 개발 Flow

```
/dev-init          → 프로젝트 초기화
/deep-interview    → 요구사항 수집
(기획/설계)         → STP, SRS/PRD, Architecture
/dev-autopilot     → 문서 게이트 포함 자동 개발
```

## 스킬 목록

| 스킬 | 용도 |
|------|------|
| `/dev-init` | 프로젝트 초기화 (CLAUDE.md + 템플릿 배치) |
| `/dev-autopilot` | 문서 게이트 포함 개발 Flow 오케스트레이션 |
| `/security-report` | 보안 점검 결과 저장 |
| `/test-report` | 테스트 결과 저장 |
| `/performance-report` | 성능 벤치마크 결과 저장 |
| `/architecture-doc` | Architecture 문서 생성 |

## 훅 목록

| 훅 | 이벤트 | 동작 |
|----|--------|------|
| `session-start.mjs` | SessionStart | OMC + 스킬 존재 확인 |
| `pre-commit-check.mjs` | PreToolUse (Bash) | git commit 시 린트/포맷 검사 |
| `post-save-mmd.mjs` | PostToolUse (Write) | .mmd 파일 → PNG 변환 |

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
├── install.sh          # macOS / Linux
├── install.ps1         # Windows PowerShell
├── install.cmd         # Windows CMD
├── scripts/
│   └── merge-hooks-config.mjs
├── rules/
│   └── docs-omc.md
├── hooks/
│   ├── session-start.mjs
│   ├── pre-commit-check.mjs
│   └── post-save-mmd.mjs
├── skills/
│   ├── dev-init/
│   ├── dev-autopilot/
│   ├── security-report/
│   ├── test-report/
│   ├── performance-report/
│   └── architecture-doc/
└── README.md
```
