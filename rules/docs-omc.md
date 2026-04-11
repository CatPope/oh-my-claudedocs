# Docs OMC 글로벌 규칙

> 모든 프로젝트에 공통 적용되는 규칙. `~/.claude/rules/` 에 배치된다.

---

## 1. 문서 언어

모든 문서는 프로젝트 시작 시 사용자와 합의한 언어로 작성한다. CLAUDE.md의 `합의 언어` 항목을 따른다.

## 2. 문서 분류 체계

| 분류 | 문서 | 설명 |
|------|------|------|
| **논의** (사용자와 필수 작성) | SRS 또는 PRD, STP, test-plan | 기획/테스트 단계에서 사용자와 합의 |
| **논의 (선택)** | GTM | 필요 시 작성 |
| **선택** (사용자 판단) | DetailedSpec | 미작성 시 에이전트 판단 + ADR 기록 |
| **필수** (에이전트 자동 생성) | Architecture, 테스트 결과, 성능 벤치마크, 보안 점검 체크리스트 | 해당 시점에 자동 생성 |
| **필수 (최종 정리)** | db-schema, api-spec, env-guide, deploy-guide, limitations, README | 개발 완료 후 유지보수 문서 |
| **상시** | ADR | 결정 발생 시점마다 누적 (단계 무관) |
| **요청** | 트러블슈팅, 온보딩, 모니터링 등 | 사용자 요청 시 작성 |

## 3. 문서 생성 시점

- **기획 단계**: deep-interview → STP, GTM(선택), SRS 또는 PRD
- **설계 단계**: Architecture(/architecture-doc), DetailedSpec(선택), UI/UX(designer)
- **구현 단계**: 코드 작성 (Hook으로 린트/포맷 자동)
- **테스트 단계**: test-plan(승인 게이트) → 테스트 결과, 성능 벤치마크, 보안 점검
- **완료 후**: db-schema, api-spec, env-guide, deploy-guide, limitations, README
- **상시**: ADR — 기술 결정 발생 시점마다 누적

## 4. 거버넌스 3단계

프로젝트 시작 시 사용자가 선택한다. 기본값은 **표준**.

| 단계 | 대상 | 데이터 | 보안 | 규정 |
|------|------|--------|------|------|
| **경량** | 개인/사이드 프로젝트 | 개인정보 포함 여부만 체크 | HTTPS + 환경변수 분리 | 없음 |
| **표준** | 팀/스타트업 | 접근 권한 + 백업 정책 | OWASP Top 10 + 인증/인가 | 라이선스 검토 |
| **엄격** | 엔터프라이즈/규제 산업 | 분류 체계 + 보존 기간 + 감사 로그 | 침투 테스트 + 암호화 정책 | GDPR/PCI-DSS 등 명시 |

## 5. 개발 범위 기반 스킬 자동 설치

개발 범위를 듣고 필요한 스킬을 `find-skills`로 탐색하여 자동 설치한다:
- 성능 테스트가 필요하면 → 성능 Test 스킬 탐색/설치
- 다국어 지원이 필요하면 → i18n 스킬 탐색/설치

## 6. DetailedSpec 미작성 시

사용자가 DetailedSpec을 작성하지 않기로 결정하면:
- 에이전트가 구현 시 판단한다
- 모든 판단 근거를 ADR에 기록한다

## 7. 필수 문서 자동 생성

래퍼 스킬을 사용하여 다음 문서를 자동 생성한다:
- `/test-report` → `docs/dev/test-results/test-YYYY-MM-DD.md`
- `/performance-report` → `docs/dev/performance/performance-YYYY-MM-DD.md`
- `/security-report` → `docs/dev/security-checklist/security-checklist-YYYY-MM-DD.md`
- `/architecture-doc` → `docs/dev/Architecture.md`

## 8. 프로젝트 규모별 SRS/PRD 선택

| 규모 | 문서 | 이유 |
|------|------|------|
| 소규모 (사이드, MVP) | PRD | 빠른 시작, 부족한 부분은 에이전트 판단 + ADR |
| 중/대규모 (팀, 엔터프라이즈) | SRS | IEEE 830 기반, 모호성 최소화 |

프로젝트 시작 시 사용자에게 규모를 확인하고 적절한 문서를 선택한다.

## 9. Hook 차단 시 자동 수정

Hook(pre-commit-check)이 린트/포맷 실패로 커밋을 차단하면:
1. 에이전트가 자동으로 린트/포맷 오류를 수정한다
2. 수정 후 재시도한다

## 10. 문서 연쇄 갱신 알림

상위 문서가 갱신되면 하위/연관 문서의 갱신 필요성을 사용자에게 알린다.
자동 갱신하지 않고, 사용자 확인 후 진행한다.

### 개별 문서 갱신 조건

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

### 연쇄 갱신 알림

- SRS/PRD 변경 → Architecture, DetailedSpec, test-plan 갱신 필요 여부 확인
- Architecture 변경 → DetailedSpec, test-plan 갱신 필요 여부 확인

## 11. 문서 관리 정책

- 날짜별 파일은 실행마다 신규 파일로 이력 관리
- 단일 파일의 변경 이력은 Git 커밋으로 관리 (문서 내 변경 이력 섹션 불필요)
- 자동 생성 문서는 중간 상태로 커밋하지 않고, 완성 후 커밋
- 문서 작성 실패 시 Git 커밋 단위로 롤백

## 12. IEEE vs PRD 트랙 매핑

우리 문서가 각 트랙에서 어떤 역할을 하는지 대조표:

| 우리 문서 | IEEE 트랙 | PRD 트랙 |
|-----------|-----------|----------|
| SRS (템플릿) | SRS 그 자체 | — |
| PRD (템플릿) | — | PRD 그 자체 |
| Architecture | SDD 구조 부분 | — |
| DetailedSpec (선택) | SDD 상세 부분 | Tech Spec 그 자체 |
| ADR | SDD 결정 근거 부분 | Tech Spec 결정 근거 |
| STP / GTM | 양쪽 공통 | 양쪽 공통 |
| dev-autopilot | SPMP 실행 부분 대체 | Roadmap/Backlog 부분 대체 |
