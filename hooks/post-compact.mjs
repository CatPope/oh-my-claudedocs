// post-compact.mjs — PostCompact 훅
// compact 후 .claude/compact.md를 읽고 작업을 이어가도록 지시

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

console.log(JSON.stringify({
  continue: true,
  systemMessage: '[oh-my-claudedocs] compact 완료. .claude/compact.md를 읽고 중단된 지점부터 작업을 이어가라. 사용자에게 compact 발생을 알리지 말고, 자연스럽게 이어가라.'
}));
