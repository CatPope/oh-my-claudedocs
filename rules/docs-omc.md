# Docs OMC 글로벌 규칙

> 모든 프로젝트에 공통 적용되는 규칙. `~/.claude/rules/` 에 배치된다.
> 상세 참조: `docs-omc-ref.md` (거버넌스 정의, SRS/PRD 선택 기준, 갱신 조건, IEEE 매핑)

---

## 1. 문서 언어

모든 문서는 프로젝트 시작 시 사용자와 합의한 언어로 작성한다. CLAUDE.md의 `합의 언어` 항목을 따른다.

## 2. 문서 분류 체계

| 분류 | 문서 |
|------|------|
| **논의** (필수) | SRS 또는 PRD, STP, test-plan |
| **논의** (선택) | GTM |
| **선택** | DetailedSpec (미작성 시 에이전트 판단 + ADR) |
| **필수** (자동) | Architecture, 테스트 결과, 성능 벤치마크, 보안 체크리스트 |
| **필수** (최종) | db-schema, api-spec, env-guide, deploy-guide, limitations, README |
| **상시** | ADR — 결정 발생 시점마다 누적 |

## 3. 문서 생성 시점

- **기획**: deep-interview → STP, GTM(선택), SRS 또는 PRD
- **설계**: Architecture, DetailedSpec(선택), UI/UX
- **구현**: 코드 작성 (Hook으로 린트/포맷 자동)
- **테스트**: test-plan(승인 게이트) → 테스트 결과, 성능, 보안
- **완료 후**: db-schema, api-spec, env-guide, deploy-guide, limitations, README
- **상시**: ADR

## 4. 스킬 자동 설치

개발 범위를 듣고 `find-skills`로 필요한 스킬을 탐색/설치한다.

## 5. 필수 문서 자동 생성

- `/test-report` → `docs/dev/test-results/test-YYYY-MM-DD.md`
- `/performance-report` → `docs/dev/performance/performance-YYYY-MM-DD.md`
- `/security-report` → `docs/dev/security-checklist/security-checklist-YYYY-MM-DD.md`
- `/architecture-doc` → `docs/dev/Architecture.md`

## 6. Hook 차단 시 자동 수정

린트/포맷 실패로 커밋 차단 시, 에이전트가 자동 수정 후 재시도한다.

## 7. 오류 발생 시 공식 문서 참조

라이브러리/프레임워크/도구 관련 오류 발생 시, 추측하지 말고 context7 MCP(`resolve-library-id` → `query-docs`)로 공식 문서를 먼저 확인한 뒤 해결한다.

## 8. 문서 연쇄 갱신 알림

상위 문서 갱신 시 하위/연관 문서의 갱신 필요성을 사용자에게 알린다. 자동 갱신하지 않고 사용자 확인 후 진행한다. 개별 갱신 조건은 `docs-omc-ref.md` 참조.

## 9. 문서 관리 정책

- 날짜별 파일은 실행마다 신규 파일로 이력 관리
- 단일 파일의 변경 이력은 Git 커밋으로 관리
- 자동 생성 문서는 완성 후 커밋 (중간 상태 커밋 금지)
- 문서 작성 실패 시 Git 커밋 단위로 롤백

## 10. 문서 접근 규칙

모든 문서는 첫 15줄에 제목과 대분류 목차만 포함한다 (15줄째 = `---`).
목차에는 각 섹션의 시작 줄 번호를 표기한다: `1. 섹션명 .. L줄번호`

```
## 목차
1. 목적 (Purpose) .............. L16
2. 전체 설명 (Overall Description) .. L35
3. 구체적 요구사항 (Specific Requirements) .. L78
```

- **읽기**: `limit: 15`로 목차만 먼저 읽고, L값으로 `offset` 접근. 전체를 한 번에 읽지 않는다.
- **작성**: 서브 에이전트가 작성. 15줄 헤더 구조를 반드시 유지. 본문은 16줄째부터. 작성 완료 후 목차의 L값을 실제 줄 번호로 갱신한다.
- **수정**: 수정할 섹션만 L값으로 offset 접근하여 수정. 수정 후 줄 수가 변경되면 목차의 L값을 갱신한다.
- **검토**: 목차의 L값으로 섹션별 순차 접근. 전체 로드 금지.
- **단계 전환**: 완료된 단계의 문서를 `.claudeignore`에 추가하여 context를 보호한다.

## 11. CLAUDE.md 관리 규칙

CLAUDE.md는 매 세션 자동 로드되므로 **300줄을 넘지 않는다.**

- 핵심 설정과 규칙만 포함한다. 상세 내용은 별도 문서로 분리하고 참조 경로만 남긴다.
- 수정 시 줄 수를 확인하고, 300줄 초과 시 덜 중요한 항목을 분리한다.
- Rules 파일(`docs-omc.md`)도 동일하게 간결하게 유지한다.
