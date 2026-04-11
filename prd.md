# Docs OMC - 개발 자동화 시스템 설계 명세

---

## 1. 개요

개발 전 과정을 자동화하는 에이전트 시스템.
글로벌 규칙(Rules) + 프로젝트별 설정(CLAUDE.md) + Hook + Skill 조합으로 구성된다.
기획·설계 단계 문서는 개발을 위한 문서이며, 개발 완료 후 문서는 유지보수를 위한 문서이다. 모든 문서는 사용자와 합의한 언어로 작성한다.

### 배포 구조

- **설치 (전역 1회)**: `install.sh` — OMC 설치 + 스킬/규칙/훅 배치
- **초기화 (프로젝트마다)**: `/dev-init` 스킬 — 프로젝트별 설정 및 문서 템플릿 배치

### 저장소 구조

```
docs-omc/
├── install.sh                          # 전역 설치
├── scripts/
│   └── merge-hooks-config.mjs          # settings.json 훅 안전 병합
├── rules/
│   └── docs-omc.md                    # 글로벌 규칙 → ~/.claude/rules/
├── hooks/                              # settings.json 사용자 훅 (.mjs)
│   ├── session-start.mjs               # OMC, skills 확인
│   ├── pre-commit-check.mjs            # 린트/포맷 (git commit 감지)
│   └── post-save-mmd.mjs              # 머메이드 → 이미지 변환
├── skills/
│   ├── dev-init/                       # 프로젝트 초기화 스킬
│   │   ├── SKILL.md
│   │   └── templates/
│   │       ├── CLAUDE.md.template      # 프로젝트별 설정 틀
│   │       └── docs/
│   │           └── dev/
│   │               # 개발 전 작성
│   │               ├── SRS.template.md             # 목차, 사용자 논의 (SRS 또는 PRD 선택)
│   │               ├── PRD.template.md             # 목차, 사용자 논의 (SRS 또는 PRD 선택)
│   │               ├── STP.template.md             # 빈 템플릿, 사용자 논의, skill 사용
│   │               ├── GTM.template.md             # 빈 템플릿, 사용자 논의, skill 사용 (선택)
│   │               ├── DetailedSpec.template.md    # 목차, 일부 사용자 논의
│   │               ├── Architecture.template.md    # 목차, skill 사용
│   │               # 테스트 중 작성
│   │               ├── test-plan.template.md       # 빈 템플릿, 사용자 논의
│   │               ├── test-results/
│   │               │   └── test-YYYY-MM-DD.md
│   │               ├── performance/
│   │               │   └── performance-YYYY-MM-DD.md
│   │               ├── security-checklist/
│   │               │   └── security-checklist-YYYY-MM-DD.md
│   │               # 개발 완료 후 작성
│   │               ├── adr/
│   │               │   └── ...            # ADR 스킬 사용
│   │               ├── db-schema.template.md       # 빈 템플릿
│   │               ├── api-spec.template.md        # 빈 템플릿
│   │               ├── env-guide.template.md       # 빈 템플릿
│   │               ├── deploy-guide.template.md    # 빈 템플릿
│   │               └── limitations.template.md     # 빈 템플릿
│   ├── dev-autopilot/                  # autopilot 확장 (문서 게이트 포함)
│   │   └── SKILL.md
│   ├── security-report/                # security-reviewer 래퍼 → 파일 저장
│   │   └── SKILL.md
│   ├── test-report/                    # test-engineer 래퍼 → 파일 저장
│   │   └── SKILL.md
│   ├── performance-report/            # 성능 Test 래퍼 → 파일 저장
│   │   └── SKILL.md
│   └── architecture-doc/              # Architecture.md 생성
│       └── SKILL.md
└── README.md
```

---

## 2. 설치 및 초기화

### 2.1 사전 요구사항

| 항목 | 설명 |
|------|------|
| Claude Code | CLI 또는 IDE 확장 설치 완료 |
| Node.js | v18+ (훅 스크립트 실행용) |
| Git | 버전 관리 |

### 2.2 install.sh (전역 1회)

```bash
#!/bin/bash
set -e

echo "=== Docs OMC 전역 설치 ==="

# ─── 1단계: OMC 설치 확인/설치 ───
if ! claude plugin list 2>/dev/null | grep -q "oh-my-claudecode"; then
  echo "[1/5] OMC 설치 중..."
  claude plugin add oh-my-claudecode@omc
else
  echo "[1/5] OMC 이미 설치됨"
fi

# ─── 2단계: 글로벌 Rules 배치 ───
echo "[2/5] Rules 배치..."
mkdir -p ~/.claude/rules
cp rules/docs-omc.md ~/.claude/rules/docs-omc.md

# ─── 3단계: 사용자 훅 등록 ───
echo "[3/5] 훅 등록..."
mkdir -p ~/.claude/hooks/docs-omc
cp hooks/session-start.mjs    ~/.claude/hooks/docs-omc/
cp hooks/pre-commit-check.mjs ~/.claude/hooks/docs-omc/
cp hooks/post-save-mmd.mjs    ~/.claude/hooks/docs-omc/

# settings.json에 hooks 섹션 병합 (기존 설정 보존, 동일 이벤트에 append)
node scripts/merge-hooks-config.mjs

# ─── 4단계: 사전 스킬 확인 ───
echo "[4/5] 기본 스킬 확인..."
# find-skills, context7은 OMC에 이미 포함 — 존재 확인만
# 없을 경우 세션 시작 훅이 경고

# ─── 5단계: dev-init 스킬 및 래퍼 스킬 설치 ───
echo "[5/5] 스킬 설치..."
SKILLS_DIR=~/.agents/skills
for skill in dev-init dev-autopilot security-report test-report performance-report architecture-doc; do
  mkdir -p "$SKILLS_DIR/$skill"
  cp -r "skills/$skill/"* "$SKILLS_DIR/$skill/"
done

echo "=== 설치 완료 ==="
echo "프로젝트 초기화: 프로젝트 디렉토리에서 /dev-init 실행"
```

| 순서 | 동작 | 상세 |
|------|------|------|
| 1 | OMC 설치 확인/설치 | `claude plugin add oh-my-claudecode@omc` |
| 2 | `rules/docs-omc.md` → `~/.claude/rules/` 복사 | 글로벌 규칙 (문서 분류, 거버넌스, 자동 설치 등) |
| 3 | `hooks/*.mjs` → `~/.claude/hooks/docs-omc/` 복사 + `settings.json` 훅 병합 | 사용자 훅 등록 (OMC 플러그인 훅과 별도 공존) |
| 4 | 사전 스킬 확인 | `find-skills`, `context7`은 OMC에 포함 |
| 5 | 커스텀 스킬 설치 | `dev-init`, `dev-autopilot`, `security-report`, `test-report`, `performance-report`, `architecture-doc` |

### 2.3 /dev-init 스킬 (프로젝트마다)

install.sh 이후, 각 프로젝트 디렉토리에서 Claude Code 세션을 열고 `/dev-init`을 실행한다.

| 순서 | 동작 |
|------|------|
| 0 | Git 확인: `git init` 안 된 프로젝트면 초기화 + 초기 커밋 제안 (롤백 정책 전제조건) |
| 1 | `CLAUDE.md` 템플릿 → 프로젝트 루트에 복사 (OMC 섹션과 Docs OMC 섹션 분리) |
| 2 | `docs/dev/` 폴더 + 모든 문서 템플릿 배치 |
| 3 | 필요 스킬 확인 (`find-skills`로 탐색/설치): `stp-framework`, `gtm-strategy`, `architecture-decision-records`, `mermaid-cli` |
| 4 | 사용자에게 프로젝트 규모 질문 → SRS / PRD 선택 |

> **멱등성**: `/dev-init`은 기존 파일이 있으면 덮어쓰지 않는다. 이미 존재하는 문서는 건너뛰고, 누락된 템플릿만 추가한다.

> 개발 범위 청취 → 추가 skill 자동 설치는 `/dev-init`이 아닌 세션 시작 후 에이전트(Rules)가 수행한다.

### 2.4 전체 설치 흐름도

```
처음 설치하는 사용자
│
├─ 1) Claude Code 설치 (공식 문서 참조)
│
├─ 2) docs-omc 저장소 클론
│      git clone <docs-omc-repo>
│
├─ 3) install.sh 실행 (1회)
│      ├─ OMC 플러그인 설치
│      ├─ ~/.claude/rules/docs-omc.md 배치
│      ├─ ~/.claude/hooks/docs-omc/*.mjs 배치
│      ├─ settings.json에 훅 등록
│      └─ ~/.agents/skills/ 에 커스텀 스킬 6개 설치
│
├─ 4) 새 프로젝트 시작
│      cd my-project && claude
│
├─ 5) /dev-init 실행 (프로젝트마다)
│      ├─ CLAUDE.md 템플릿 배치
│      ├─ docs/dev/ 문서 템플릿 배치
│      ├─ 필요 스킬 탐색/설치 (find-skills)
│      └─ 프로젝트 규모 → SRS/PRD 선택
│
└─ 6) 개발 시작
       /deep-interview → 기획 → 설계 → 구현 → 테스트 → 완료
```

---

## 3. Hook

OMC 플러그인 훅(`hooks.json`)은 플러그인 소유로 사용자 확장 불가. Docs OMC 훅은 `settings.json`의 사용자 훅으로 등록하며, 두 시스템은 병렬 공존한다 (플러그인 훅 → 사용자 훅 순차 실행).

### 3.1 훅 목록

| 스크립트 | Claude Code 이벤트 | matcher | 동작 | 실패 시 |
|----------|-------------------|---------|------|---------|
| `session-start.mjs` | `SessionStart` | `""` | OMC + find-skills + context7 존재 확인, 없으면 경고 | 경고 후 계속 |
| `pre-commit-check.mjs` | `PreToolUse` | `"Bash"` | `toolInput.command`에서 `git commit` 감지 시 린트/포맷 실행 | 차단 (`continue: false`) + 에이전트 자동 수정 후 재시도 |
| `post-save-mmd.mjs` | `PostToolUse` | `"Write"` | `toolInput.file_path`가 `.mmd`면 `mmdc`로 PNG 변환 | 경고 (이미지 없이 진행) |

### 3.2 settings.json 훅 등록 형태

`install.sh`의 `merge-hooks-config.mjs`가 기존 설정을 보존하며 아래 내용을 병합한다:

```jsonc
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [{
          "type": "command",
          "command": "node ~/.claude/hooks/docs-omc/session-start.mjs",
          "timeout": 5
        }]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "node ~/.claude/hooks/docs-omc/pre-commit-check.mjs",
          "timeout": 10
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [{
          "type": "command",
          "command": "node ~/.claude/hooks/docs-omc/post-save-mmd.mjs",
          "timeout": 15
        }]
      }
    ]
  }
}
```

### 3.3 훅 스크립트 프로토콜

OMC와 동일한 stdin/stdout JSON 프로토콜을 따른다:

```javascript
// post-save-mmd.mjs
import { execSync } from 'child_process';

// Windows 호환: /dev/stdin 대신 process.stdin 사용
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
const filePath = input.toolInput?.file_path || '';

if (filePath.endsWith('.mmd')) {
  try {
    execSync(`npx mmdc -i "${filePath}" -o "${filePath.replace('.mmd', '.png')}"`);
    console.log(JSON.stringify({
      continue: true,
      systemMessage: `Mermaid diagram converted: ${filePath} -> PNG`
    }));
  } catch (e) {
    console.log(JSON.stringify({
      continue: true,
      systemMessage: `Warning: Mermaid conversion failed for ${filePath}`
    }));
  }
} else {
  console.log(JSON.stringify({ continue: true }));
}
```

> Hook은 "판단 없이 매번 같은 동작"인 것만 포함한다. 모든 훅은 `.mjs`(Node.js ESM)로 작성하여 Windows/macOS/Linux 크로스 플랫폼을 보장한다.

---

## 4. Skill

스킬은 3개 계층으로 구분된다: OMC 내장 → 외부 (find-skills 탐색/설치) → 커스텀 (docs-omc 제공).

### 4.1 OMC 내장 (install.sh에서 확인)

| Skill | 비고 |
|-------|------|
| `find-skills` | skill 탐색용, OMC에 포함 |
| `context7` | 문서 참조용, OMC MCP 서버로 포함 |

### 4.2 외부 스킬 (/dev-init에서 find-skills로 탐색/설치)

| Skill | OMC 대응 이름 | 용도 |
|-------|--------------|------|
| `stp` | `stp-framework` | 시장/타겟 전략 |
| `gtm` | `gtm-strategy` | 출시 전략 |
| `architecture-patterns` | `architecture-decision-records` | ADR 문서 (부분 매칭 — 전체 Architecture 문서는 커스텀 스킬 보완) |
| `mermaid-cli` | find-skills로 탐색 | .mmd → 이미지 변환 도구 설치 (Hook의 `post-save-mmd.mjs`가 `mmdc` CLI를 호출) |

> SRS / PRD는 skill이 아닌 **템플릿 목차**로 제공. `docs/dev/` 에 배치되며 에이전트가 deep-interview 결과를 기반으로 목차에 따라 작성한다.

### 4.3 커스텀 스킬 (install.sh에서 설치)

| Skill | 용도 | 상세 |
|-------|------|------|
| `dev-init` | 프로젝트 초기화 | CLAUDE.md + docs/dev/ 템플릿 배치, 외부 스킬 탐색/설치, SRS/PRD 선택 |
| `dev-autopilot` | 개발 Flow 오케스트레이션 | OMC autopilot 확장 — 문서 게이트 추가 (테스트 전 test-plan 승인 등) |
| `security-report` | 보안 점검 결과 저장 | `security-reviewer` 에이전트 래퍼 → `docs/dev/security-checklist/security-checklist-YYYY-MM-DD.md` |
| `test-report` | 테스트 결과 저장 | `test-engineer` + `verifier` 에이전트 래퍼 → `docs/dev/test-results/test-YYYY-MM-DD.md` |
| `architecture-doc` | Architecture 문서 생성 | 시스템 개요, 모듈/레이어, 데이터 흐름, 인프라 토폴로지 → `docs/dev/Architecture.md` |
| `performance-report` | 성능 벤치마크 결과 저장 | 성능 Test 스킬 래퍼 → `docs/dev/performance/performance-YYYY-MM-DD.md` |

> 읽기전용 에이전트(`security-reviewer`, `code-reviewer`, `verifier`)는 콘솔 출력만 하므로, 래퍼 스킬이 출력을 캡처하여 날짜별 파일로 저장한다.

### 4.4 개발 범위 따라 설치

| Skill | 비고 |
|-------|------|
| 성능 Test | find-skills로 탐색/설치 |
| `i18n` | 다국어 필요 시, find-skills로 탐색/설치 |

### 4.5 프로젝트 규모별 요구사항 문서 선택

| 규모 | 문서 | 이유 |
|------|------|------|
| 소규모 (사이드, MVP) | PRD | 빠른 시작, 부족한 부분은 에이전트 판단 + ADR |
| 중/대규모 (팀, 엔터프라이즈) | SRS | IEEE 830 기반, 모호성 최소화 |

---

## 5. OMC 내장 에이전트

별도 설치 불필요. OMC에 포함되어 있음.

| 역할 | 에이전트 | 활용 시점 |
|------|----------|-----------|
| UI/UX | `oh-my-claudecode:designer` | 디자인/프론트엔드 설계 |
| 보안 점검 | `oh-my-claudecode:security-reviewer` | 구현 완료 후 |
| 디버깅/에러 처리 | `oh-my-claudecode:debugger` | 구현 중 |
| 코드 리뷰 | `oh-my-claudecode:code-reviewer` | PR/구현 완료 시 |
| 기능 테스트 | `oh-my-claudecode:test-engineer` + `qa-tester` + `verifier` | 테스트 단계 |

> 읽기전용 에이전트(security-reviewer, code-reviewer, verifier 등)는 결과를 콘솔에만 출력한다. 문서로 저장하려면 커스텀 래퍼 스킬(`/security-report`, `/test-report`)을 사용한다 (4.3절 참조).

---

## 6. Rules (글로벌 `~/.claude/rules/docs-omc.md`)

모든 프로젝트에 공통 적용되는 규칙.

| 규칙 |
|------|
| 모든 문서는 사용자와 합의한 언어로 작성 |
| 문서 분류 체계 (논의 / 선택 / 필수 / 상시 / 요청) |
| 각 문서의 목차 및 생성 시점 |
| 거버넌스 3단계 정의 (경량 / 표준 / 엄격) |
| 개발 범위 듣고 skill 자동 설치 규칙 |
| DetailedSpec 없으면 에이전트 판단 + ADR에 근거 기록 |
| 필수 문서 자동 생성 규칙 |
| 프로젝트 규모 확인 후 SRS/PRD 선택 |
| Hook 차단 시 에이전트가 자동 수정 후 재시도 (린트/포맷 실패 등) |
| 상위 문서 갱신 시 하위/연관 문서의 갱신 필요성을 사용자에게 알림 |

---

## 7. CLAUDE.md (프로젝트별)

설계 단계 완료 후 승인을 거쳐 프로젝트 루트에 작성. 설계 승인은 설계 단계의 마지막 게이트이다.

> **OMC 공존**: CLAUDE.md는 OMC도 읽고 참조한다. Docs OMC 설정과 OMC 가이드가 충돌하지 않도록 섹션을 명확히 분리한다.

```markdown
<!-- DOCS-OMC-CONFIG-START -->
## 프로젝트 설정
(아래 표의 내용이 여기에 작성됨)
<!-- DOCS-OMC-CONFIG-END -->

(OMC가 자동 주입하는 가이드는 이 영역 밖에 위치)
```

| 내용 | 작성 주체 |
|------|-----------|
| 합의 언어 | 사용자 선택 후 |
| 속도 vs 보안 판단 결과 | 에이전트 자동 판단 |
| 거버넌스 단계 선택 결과 (경량/표준/엄격) | 사용자 선택 후 |
| Git 규칙 (브랜치, 커밋 컨벤션) | 사용자 동의 후 |
| 코드 품질 기준 (커버리지, 복잡도) | 사용자 동의 후 |
| 기술 스택 확정 | 사용자 선택 후 |

---

## 8. 문서 체계

### 8.1 문서 분류 (4계층)

| 분류 | 문서 | 설명 | OMC 지원 | Docs OMC 보완 |
|------|------|------|----------|----------------|
| **논의** (사용자와 필수 작성) | SRS 또는 PRD, STP, test-plan | 기획/테스트 단계에서 합의 | △ (SRS/PRD), X (STP, test-plan) | 템플릿 목차 제공 |
| **논의 (선택)** | GTM | 필요 시 작성 | X | 템플릿 목차 제공 |
| **선택** (사용자 판단) | DetailedSpec | 미작성 시 에이전트 판단 + ADR 기록 | △ | 템플릿 목차 제공 |
| **필수** (에이전트 자동 생성) | Architecture, 테스트 결과, 성능 벤치마크, 보안 점검 체크리스트 | 해당 시점에 자동 생성 | △ (Architecture) | `/architecture-doc`, `/test-report`, `/security-report` 스킬로 자동화 |
| **필수 (최종 정리)** | db-schema, api-spec, env-guide, deploy-guide, limitations, README | 개발 완료 후 유지보수를 위한 문서 | O (README), △ (나머지) | 템플릿 제공 |
| **상시** | ADR | 결정 발생 시점마다 누적 (단계 무관) | △ (`architecture-decision-records` 스킬) | Rules에서 자동 누적 지시 |
| **요청** (사용자 요청 시) | 트러블슈팅 가이드, 온보딩 가이드, 모니터링/알림 설정, 그 외 | 시점 무관 | — | — |

> **OMC 지원 범례**: O = OMC 자동 생성 flow 존재, △ = 에이전트가 작성 가능하나 자동 flow 없음, X = OMC 미지원. **Docs OMC 보완** 컬럼은 커스텀 스킬/훅/템플릿으로 갭을 메우는 방식을 표시한다.

### 8.2 문서 생성 시점

```
프로젝트 시작
│
├─ 기획 단계
│   ├─ [OMC] deep-interview    ── 요구사항 수집
│   ├─ [논의] STP              ── 시장/타겟 정의
│   ├─ [논의] GTM              ── 출시 전략 (선택)
│   └─ [논의] SRS 또는 PRD     ── 템플릿 목차 + deep-interview 기반
│
├─ 설계 단계 (deep-interview + planning 결과 기반)
│   ├─ [필수] Architecture     ── 전체 구조 확정 (/architecture-doc)
│   ├─ [선택] DetailedSpec     ── 목차 + planning 기반
│   ├─ [OMC: designer]         ── UI/UX 설계
│   └─ [CLAUDE.md 작성]        ── 속도/보안, Git, 품질, 거버넌스, 언어
│
├─ 구현 단계
│   └─ (코드 작성, Hook으로 린트/포맷 자동 실행)
│
├─ 테스트 단계
│   ├─ [논의] test-plan        ── 사용자 승인 후 테스트 진행 (게이트)
│   ├─ [필수] 테스트 결과       ── 실행 후 (test-YYYY-MM-DD.md)
│   ├─ [필수] 성능 벤치마크     ── 성능 테스트 후 (performance-YYYY-MM-DD.md)
│   └─ [필수] 보안 점검 체크리스트 ── 보안 리뷰 후 (security-checklist-YYYY-MM-DD.md)
│
├─ 개발 완료 후 (최종 정리)
│   ├─ [필수] db-schema        ── 완성된 코드 기반 최종 정리
│   ├─ [필수] api-spec         ── 완성된 코드 기반 최종 정리
│   ├─ [필수] env-guide        ── 환경 변수 최종 정리
│   ├─ [필수] deploy-guide     ── 배포 절차 정리
│   ├─ [필수] limitations      ── 제한사항 정리
│   └─ [필수] README           ── 프로젝트 개요
│
├─ [상시] ADR                  ── 결정 발생 시점마다 누적 (단계 무관)
│
└─ 사용자 요청 시 (시점 무관)
    ├─ 트러블슈팅 가이드
    ├─ 온보딩 가이드
    ├─ 모니터링/알림 설정
    └─ 그 외
```

### 8.3 아키텍처 문서 역할 분리

| 도구 | 역할 | 범위 | 유형 |
|------|------|------|------|
| `/architecture-doc` | Architecture.md 생성 (시스템 개요, 모듈/레이어, 데이터 흐름, 인프라) | 설계 단계 | 커스텀 스킬 |
| `architecture-decision-records` | ADR 문서 작성 (결정 근거 기록) | 상시 — 결정 발생 시점마다 | 외부 스킬 (OMC) |
| `mermaid-cli` | 다이어그램 이미지 변환 도구 (Hook에서 자동 실행) | 도구로만 사용 | 외부 스킬 (find-skills) |

### 8.4 DetailedSpec 목차

선택 문서. 작성 시 아래 목차를 따른다.

```
1. 디자인
   1.1 제품 유형 및 사용 컨텍스트
   1.2 디자인 스타일 키워드 (포함 + 배제)
   1.3 컬러 시스템 (다크 모드 전략 포함)
   1.4 타이포그래피
   1.5 아이콘 시스템
   1.6 간격/그리드 시스템
   1.7 애니메이션 토큰

2. 기술 스택
   2.1 프로그래밍 언어
   2.2 프레임워크

3. 에러 처리 정책
   3.1 에러 응답 스키마
   3.2 사용자 노출 vs 내부 에러 구분
   3.3 재시도 정책

4. 테스트 전략
   4.1 Critical User Journey 목록
   4.2 모듈별 커버리지 목표
   4.3 외부 의존성 Mocking 전략

5. 보안 상세
   5.1 프로젝트 고유 공격 표면
   5.2 로그 민감정보 마스킹 규칙

6. 상태 정의
   6.1 핵심 엔티티 상태 머신
   6.2 동시성 시나리오

7. 국제화
   7.1 지원 언어 및 로케일
   7.2 숫자/날짜/통화 포맷

8. API 버전 관리
   8.1 버전 체계
   8.2 Breaking Change 정책

9. 거버넌스
   9.1 데이터 거버넌스
   9.2 보안 거버넌스
   9.3 규정 준수
```

### 8.5 필수 문서 템플릿 핵심 섹션

| 템플릿 | 핵심 섹션 |
|--------|-----------|
| Architecture | 시스템 개요, 모듈/레이어, 데이터 흐름, 인프라 토폴로지, 통신 방식, 확장 전략 |
| ADR | 번호, 상태(제안/승인/폐기), 맥락, 결정, 결과 |
| test-plan | 테스트 범위, 테스트 유형, 환경, 일정, 합격 기준 |
| test-results (날짜별) | 실행 일시, 환경, 통과/실패 수, 커버리지, 실패 상세 |
| performance (날짜별) | 실행 일시, 측정 항목, 기준값(SRS 기반), 실측값, 환경 |
| security-checklist (날짜별) | 실행 일시, 점검 항목, 통과/실패/해당없음, 심각도, 조치 내용 |
| db-schema | 테이블 목록, 컬럼 정의, 관계(ERD), 인덱스, 마이그레이션 이력 |
| api-spec | 엔드포인트, 메서드, 요청/응답 스키마, 인증, 에러 코드 |
| env-guide | 변수명, 설명, 타입, 기본값, 필수 여부 |
| deploy-guide | 사전 조건, 단계별 절차, 검증 방법, 롤백 절차 |
| limitations | 항목, 설명, 영향 범위, 우회 방법/대안, 해결 예정일 |
| README | 프로젝트 개요, 설치 방법, 사용법, 기여 가이드 |

---

## 9. 거버넌스 3단계

프로젝트 시작 시 사용자가 선택. 기본값은 표준.

| 단계 | 대상 | 범위 |
|------|------|------|
| **경량** | 개인/사이드 프로젝트 | 데이터: 개인정보 포함 여부만 체크, 보안: HTTPS + 환경변수 분리, 규정: 없음 |
| **표준** | 팀/스타트업 | 데이터: 접근 권한 + 백업 정책, 보안: OWASP Top 10 + 인증/인가, 규정: 라이선스 검토 |
| **엄격** | 엔터프라이즈/규제 산업 | 데이터: 분류 체계 + 보존 기간 + 감사 로그, 보안: 침투 테스트 + 암호화 정책, 규정: GDPR/PCI-DSS 등 명시 |

---

## 10. 전체 개발 Flow

```
┌─────────────────────────────────────────────────────────┐
│                    1. 최초 설치 (1회)                     │
│                      install.sh                          │
├─────────────────────────────────────────────────────────┤
│  OMC 설치 확인/설치                                      │
│  ~/.claude/rules/docs-omc.md 배치                       │
│  ~/.claude/hooks/docs-omc/*.mjs 배치                    │
│  settings.json에 사용자 훅 등록                           │
│  커스텀 스킬 6개 설치 (~/.agents/skills/)                 │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│              2. 프로젝트 초기화 (프로젝트마다)             │
│                    /dev-init 스킬                         │
├─────────────────────────────────────────────────────────┤
│  CLAUDE.md 템플릿 복사                                   │
│  docs/dev/ 폴더 + 템플릿 배치                            │
│  find-skills로 외부 스킬 탐색/설치                        │
│  프로젝트 규모 → SRS/PRD 선택                             │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  3. 세션 시작 (매 세션)                    │
│              [Hook: session-start.mjs]                    │
├─────────────────────────────────────────────────────────┤
│  OMC 설치 확인                                           │
│  find-skills, context7 확인                              │
│  Rules 로드 (docs-omc.md)                               │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    4. 기획 단계                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  사용자 ← 합의 → 에이전트                                │
│  │                                                      │
│  ├─ 합의 언어 결정                                       │
│  ├─ 프로젝트 규모 확인 → SRS / PRD 선택                  │
│  │                                                      │
│  ├─ [OMC: deep-interview] 요구사항 수집                   │
│  │                                                      │
│  ├─ [Skill: stp] STP 작성          ┐                    │
│  ├─ [Skill: gtm] GTM 작성 (선택)   ├ 병렬 작성 가능      │
│  ├─ [템플릿 목차 + deep-interview 기반]                   │
│  │   SRS 또는 PRD 작성              ┘                    │
│  │                                                      │
│  └─ 개발 범위 확정                                       │
│       ├─ 범위 기반 skill 자동 설치                        │
│       │   ├─ 성능 Test (find-skills 탐색)                │
│       │   └─ i18n (다국어 필요 시)                       │
│       │                                                 │
│       └─ DetailedSpec 작성 여부 결정                      │
│            ├─ YES → 설계 단계에서 작성                    │
│            └─ NO  → 에이전트 판단, ADR에 근거 기록        │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    5. 설계 단계                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ※ deep-interview + planning 결과를 기반으로 작성         │
│                                                         │
│  [Skill: /architecture-doc]                              │
│     Architecture 작성 (구조 + 다이어그램 + 결정 근거)     │
│  [선택] DetailedSpec 작성 (목차 + planning 기반)          │
│  [OMC: designer] UI/UX 설계                              │
│                                                         │
│  ┌─ 설계 승인 ──────────────────────────────────┐       │
│  │                                               │       │
│  │  에이전트 자동 판단 → CLAUDE.md                │       │
│  │  └─ 속도 vs 보안 구분 결과                     │       │
│  │                                               │       │
│  │  사용자 동의 후 → CLAUDE.md                    │       │
│  │  ├─ 거버넌스 단계 (경량/표준/엄격)              │       │
│  │  ├─ Git 규칙 (브랜치, 커밋 컨벤션)             │       │
│  │  ├─ 코드 품질 기준 (커버리지, 복잡도)           │       │
│  │  └─ 기술 스택 확정                             │       │
│  └───────────────────────────────────────────────┘       │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    6. 구현 단계                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Hook: pre-commit-check.mjs] 린트/포맷 자동 실행        │
│  [Hook: post-save-mmd.mjs] 머메이드 → 이미지 변환        │
│                                                         │
│  [OMC: debugger]       에러 처리                         │
│  [OMC: code-reviewer]  코드 리뷰                         │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   7. 테스트 단계                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [논의] test-plan 작성 → 사용자 승인 (게이트)             │
│                                                         │
│  ── 승인 후 테스트 진행 ──                                │
│                                                         │
│  [OMC: test-engineer]     테스트 작성                    │
│  [OMC: qa-tester]         기능 검증                      │
│  [Skill: 성능 Test]       성능 벤치마크                   │
│  [OMC: security-reviewer] 보안 점검                      │
│  [OMC: verifier]          최종 검증                      │
│                                                         │
│  [필수 문서 자동 생성 — 래퍼 스킬 사용]                    │
│  ├─ /test-report → test-YYYY-MM-DD.md                    │
│  ├─ /performance-report → performance-YYYY-MM-DD.md      │
│  └─ /security-report → security-checklist-YYYY-MM-DD.md  │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│               8. 개발 완료 후 (최종 정리)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  완성된 코드 기반으로 유지보수를 위한 최종 문서 작성           │
│  ├─ db-schema          ── DB 구조 최종 정리              │
│  ├─ api-spec           ── API 최종 정리                  │
│  ├─ env-guide          ── 환경 변수 최종 정리             │
│  ├─ deploy-guide       ── 배포 절차 정리                 │
│  ├─ limitations        ── 제한사항 정리                   │
│  └─ README             ── 프로젝트 개요                  │
│                                                         │
└─────────────────────────────────────────────────────────┘

[상시] ADR ── 결정 발생 시점마다 누적 (단계 무관)

※ 사용자 요청 시 (시점 무관)
   ── 트러블슈팅 가이드, 온보딩 가이드, 모니터링 설정, 그 외
```

---

## 11. 문서 갱신 규칙

| 문서 | 갱신 조건 |
|------|-----------|
| STP | 시장/전략 변경 시 |
| GTM | 출시 전략 변경 시 |
| SRS / PRD | 요구사항 변경 시 |
| Architecture | 아키텍처 변경 시 |
| DetailedSpec | 구현 중 + 배포 후 주기적 (있을 경우) |
| ADR | 기술 결정 발생 시마다 누적 (단계 무관) |
| test-plan | 테스트 범위/전략 변경 시 |
| 테스트 결과 | 테스트 실행마다 (날짜별 신규 파일) |
| 성능 벤치마크 | 성능 테스트마다 (날짜별 신규 파일) |
| 보안 점검 체크리스트 | 보안 리뷰마다 (날짜별 신규 파일) |
| db-schema | 개발 완료 시 작성, 이후 스키마 변경 시 갱신 |
| api-spec | 개발 완료 시 작성, 이후 API 변경 시 갱신 |
| env-guide | 개발 완료 시 작성, 이후 환경 변수 추가 시 갱신 |
| deploy-guide | 개발 완료 시 작성, 이후 절차 변경 시 갱신 |
| limitations | 개발 완료 시 작성, 이후 발견 시 갱신 |
| README | 개발 완료 시 작성, 이후 주요 변경 시 갱신 |
| CLAUDE.md | 기술 스택 변경, 거버넌스 단계 변경, Git 규칙 변경 시 갱신 |

> **연쇄 갱신 규칙**: 상위 문서(SRS/PRD, Architecture)가 갱신되면, 에이전트는 하위/연관 문서(test-plan, DetailedSpec 등)의 갱신 필요성을 사용자에게 알린다. 자동 갱신하지 않고 사용자 확인 후 진행한다.

---

## 12. 문서 관리 정책

### 12.1 버전 관리

- 날짜별 파일(test-YYYY-MM-DD.md 등)은 실행마다 신규 파일로 이력이 자연 관리된다.
- 단일 파일(SRS, Architecture 등)의 변경 이력은 **Git 커밋 이력**으로 관리한다. 문서 내 별도 변경 이력 섹션은 두지 않는다.

### 12.2 갱신 시 승인 절차

| 문서 분류 | 신규 생성 | 갱신 |
|-----------|-----------|------|
| **논의** | 사용자 합의 필수 | 사용자 합의 필수 |
| **선택** | 사용자 확인 필수 | 사용자 확인 필수 |
| **필수** (자동 생성) | 승인 불필요 | 승인 불필요 |
| **필수** (최종 정리) | 사용자 확인 후 생성 | 승인 불필요 |
| **상시** (ADR) | 승인 불필요 (누적) | 상태 변경 시 사용자 확인 |

### 12.3 에러 핸들링

- 에이전트가 문서 작성 중 실패하면 **Git 커밋 단위로 롤백**한다.
- 자동 생성 문서는 중간 상태로 커밋하지 않는다. 완성 후 커밋한다.

---

## 13. IEEE vs PRD 트랙 매핑

양 트랙에서 우리 문서가 어떤 역할을 하는지 대조표.

| 우리 문서 | IEEE 트랙 | PRD 트랙 |
|-----------|-----------|----------|
| SRS (템플릿) | SRS 그 자체 | — |
| PRD (템플릿) | — | PRD 그 자체 |
| Architecture | SDD 구조 부분 | — |
| DetailedSpec (선택) | SDD 상세 부분 | Tech Spec 그 자체 |
| ADR | SDD 결정 근거 부분 | Tech Spec 결정 근거 |
| STP / GTM | 양쪽 공통 | 양쪽 공통 |
| OMC 파이프라인 (`/dev-autopilot`) | SPMP 실행 부분 대체 | Roadmap/Backlog 부분 대체 |
