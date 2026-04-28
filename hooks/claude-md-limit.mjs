// claude-md-limit.mjs — PreToolUse/Write|Edit 훅
// CLAUDE.md 파일이 300줄을 초과하면 저장 차단

import { readFileSync } from 'fs';

const MAX_LINES = 300;

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

let input;
try {
  input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
} catch {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

const toolName = input.tool_name || '';
const toolInput = input.tool_input || {};
const filePath = toolInput.file_path || '';

// CLAUDE.md 대상만 검사 (MY_CLAUDE.md 등 오매칭 방지)
const fileName = filePath.replace(/\\/g, '/').split('/').pop();
if (fileName !== 'CLAUDE.md') {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

let lineCount = 0;

if (toolName === 'Write') {
  // Write: content 필드의 줄 수 직접 카운트
  const content = toolInput.content || '';
  lineCount = content.split('\n').length;
} else if (toolName === 'Edit') {
  // Edit: 현재 파일 읽고 교체 시뮬레이션
  try {
    const current = readFileSync(filePath, 'utf8');
    const oldStr = toolInput.old_string || '';
    const newStr = toolInput.new_string || '';
    if (oldStr && current.includes(oldStr)) {
      const after = toolInput.replace_all
        ? current.replaceAll(oldStr, newStr)
        : current.replace(oldStr, newStr);
      lineCount = after.split('\n').length;
    } else {
      // old_string 매칭 실패 — Edit 자체가 실패할 것이므로 통과
      console.log(JSON.stringify({ continue: true }));
      process.exit(0);
    }
  } catch {
    // 파일 읽기 실패 — 통과 (새 파일일 수 있음)
    console.log(JSON.stringify({ continue: true }));
    process.exit(0);
  }
} else {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

if (lineCount > MAX_LINES) {
  console.log(JSON.stringify({
    continue: false,
    stopReason: `[oh-my-claudedocs] CLAUDE.md ${MAX_LINES}줄 제한 초과 (현재 ${lineCount}줄). 덜 중요한 내용을 별도 파일로 분리하세요.`
  }));
} else {
  console.log(JSON.stringify({ continue: true }));
}
