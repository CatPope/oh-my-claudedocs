// post-compact.mjs — PostCompact 훅
// compact 후 Note.md를 읽고 작업을 이어가도록 지시

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

console.log(JSON.stringify({
  continue: true,
  systemMessage: '[Docs OMC] compact 완료. .agent/Note.md를 읽고 현재 상태를 파악한 뒤 작업을 이어가라.'
}));
