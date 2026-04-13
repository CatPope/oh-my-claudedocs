// pre-compact.mjs — PreCompact 훅
// compact 전에 현재 상태를 Note.md에 기록하도록 지시

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

const prompt = `compact가 곧 실행된다. 현재 진행 상태를 .agent/Note.md에 기록하라.

## 프로젝트 상태
- 현재 단계: (기획/설계/구현/테스트/최종정리)
- 설계 승인 게이트: (미도달/대기중/통과)
- test-plan 승인 게이트: (미도달/대기중/통과)

## 완료 문서
- (작성 완료된 문서 목록)

## 진행중 작업
- (현재 수행 중인 작업과 상태)

## 미결 사항
- (사용자 확인 대기, 블로커, 결정 필요 사항)

## .claudeignore 상태
- (현재 차단된 문서 목록)

## 다음 단계
- (즉시 수행할 작업 1~3개)`;

console.log(JSON.stringify({
  continue: true,
  systemMessage: `[Docs OMC] ${prompt}`
}));
