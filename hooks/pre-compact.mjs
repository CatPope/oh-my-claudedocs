// pre-compact.mjs — PreCompact 훅
// compact 전에 현재 실행 계획과 상태를 .claude/compact.md에 기록하도록 지시

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

// .claudeignore를 임시 해제: 백업 후 초기화
const projectRoot = process.cwd();
const claudeignorePath = join(projectRoot, '.claudeignore');
const claudeignoreBackupPath = join(projectRoot, '.claudeignore.backup');

if (existsSync(claudeignorePath)) {
  const content = readFileSync(claudeignorePath, 'utf8');
  writeFileSync(claudeignoreBackupPath, content, 'utf8');
  writeFileSync(claudeignorePath, '', 'utf8');
}

const prompt = `compact가 곧 실행된다. 현재 대화의 모든 핵심 컨텍스트를 .claude/compact.md에 기록하라.
빠짐없이, 최대한 상세하게 기록한다. 이 파일이 compact 후 유일한 복구 수단이다.

# Compact Recovery Note

## 1. 사용자 요청 (원문 보존)
- 사용자가 처음 요청한 작업 원문
- 이후 추가/변경된 요구사항

## 2. 실행 계획
- 전체 계획 (단계별 목록)
- 각 단계의 상태: [완료] / [진행중] / [대기]
- 현재 진행 중인 단계와 세부 작업

## 3. 완료된 작업
- 수행한 작업 목록 (파일 경로 + 변경 내용 요약)
- 생성/수정/삭제한 파일 전체 목록
- 커밋 내역 (있을 경우)

## 4. 핵심 결정 사항
- 사용자와 합의한 설계/구현 결정
- 결정 이유 (왜 이 방식을 선택했는지)
- 사용자가 거부/수정한 제안

## 5. 진행중 작업 상세
- 현재 작업 중인 파일과 수정 의도
- 중단된 지점 (어디까지 했고, 다음에 뭘 해야 하는지)
- 작업에 필요한 참조 정보 (변수명, 함수명, 줄 번호 등)

## 6. 발견한 문제와 해결
- 발생한 에러와 해결 방법
- 아직 해결되지 않은 문제
- 시도했으나 실패한 접근법 (재시도 방지)

## 7. 사용자 피드백/교정
- 사용자가 교정한 내용 ("그거 말고 이렇게 해", "아닙니다" 등)
- 사용자 선호사항 (코드 스타일, 네이밍, 언어 등)

## 8. 미결 사항
- 사용자 확인 대기 중인 질문
- 블로커 (외부 의존성, 권한 등)
- 결정 필요 사항

## 9. 다음 단계
- compact 후 즉시 수행할 작업 (우선순위 순)
- 각 작업의 구체적 실행 방법

## 10. 프로젝트 컨텍스트
- 프로젝트 경로, 기술 스택
- 관련 파일 구조 (현재 작업 범위)
- Git 브랜치, 리모트 상태

## 11. 문서 현황 (docs/dev/)
모든 문서에 접근 가능하다. .claudeignore가 임시 해제되었다. docs/dev/ 내 모든 문서의 현재 상태(존재 여부, 주요 내용 요약)를 compact.md에 기록하라.

## 12. Git 상태 (자동 수집)
아래 명령어를 실행하여 결과를 compact.md에 기록하라:
- \`git status --short\` — 현재 변경 상태
- \`git log --oneline -10\` — 최근 10개 커밋
- \`git diff --stat\` — 변경 파일 통계
- \`git branch --show-current\` — 현재 브랜치

## 13. 문서 갱신 필요 여부
Git 변경 사항을 기반으로 docs/dev/ 문서 중 갱신이 필요한 것을 판단하라:
- SQL/migration/schema 파일 변경 → db-schema.md
- API/routes/controllers 파일 변경 → api-spec.md
- .env/config 파일 변경 → env-guide.md
- SRS/PRD 변경 → Architecture, DetailedSpec, test-plan (연쇄)
- Architecture 변경 → DetailedSpec, test-plan (연쇄)
갱신이 필요한 문서 목록과 이유를 compact.md에 기록하라.`;

console.log(JSON.stringify({
  continue: true,
  systemMessage: `[Docs OMC] ${prompt}`
}));
