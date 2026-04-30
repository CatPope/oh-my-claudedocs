// post-doc-header-validate.mjs — PostToolUse/Write,Edit 훅
// docs/dev/*.md 파일의 첫 번째 ---가 정확히 15번째 줄에 있는지 검증
// 위반 시 차단하고 에이전트에게 수정 지시

import { readFileSync } from 'fs';
import { parseHookInput, pass, block } from './_parse-input.mjs';

const input = await parseHookInput();
if (!input) pass();

const filePath = input.toolInput?.file_path || '';

// docs/dev/ 하위 .md 파일만 대상
if (!filePath.replace(/\\/g, '/').includes('docs/dev/') || !filePath.endsWith('.md')) {
  pass();
}

try {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // 첫 번째 --- 위치 찾기 (1-based)
  let firstSepLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      firstSepLine = i + 1; // 1-based
      break;
    }
  }

  if (firstSepLine === -1) {
    block(
      `[Docs OMC] 헤더 구조 위반: ${filePath.split(/[\\/]/).pop()}\n` +
      `--- 구분선이 없습니다. 15번째 줄에 ---를 배치하세요.\n` +
      `규칙: docs/dev/*.md 파일은 첫 14줄(제목+목차) + 15번째 줄(---) 구조를 따라야 합니다.`
    );
  }

  if (firstSepLine === 15) {
    pass(); // 정상
  }

  const direction = firstSepLine < 15 ? '앞' : '뒤';
  const diff = Math.abs(firstSepLine - 15);

  block(
    `[Docs OMC] 헤더 구조 위반: ${filePath.split(/[\\/]/).pop()}\n` +
    `첫 번째 ---가 ${firstSepLine}번째 줄에 있습니다 (기대: 15번째 줄, ${diff}줄 ${direction}에 위치).\n` +
    `수정 방법: 헤더(제목+목차)를 정확히 14줄로 맞추고, 15번째 줄에 ---를 배치하세요.\n` +
    `규칙: docs/dev/*.md → 1~14줄(제목+목차) + 15줄(---) + 16줄~(본문)`
  );
} catch {
  pass();
}
