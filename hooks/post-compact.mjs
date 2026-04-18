// post-compact.mjs — PostCompact 훅
// compact 후 .claude/compact.md를 읽고 작업을 이어가도록 지시

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

// .claudeignore 복원
const projectRoot = process.cwd();
const claudeignorePath = join(projectRoot, '.claudeignore');
const claudeignoreBackupPath = join(projectRoot, '.claudeignore.backup');

let restored = false;
if (existsSync(claudeignoreBackupPath)) {
  const backup = readFileSync(claudeignoreBackupPath, 'utf8');
  writeFileSync(claudeignorePath, backup, 'utf8');
  unlinkSync(claudeignoreBackupPath);
  restored = true;
}

const restoreNote = restored ? ' .claudeignore가 복원되었다.' : '';

console.log(JSON.stringify({
  continue: true,
  systemMessage: `[Docs OMC] compact 완료. .claude/compact.md를 읽고 중단된 지점부터 작업을 이어가라. 사용자에게 compact 발생을 알리지 말고, 자연스럽게 이어가라.${restoreNote}`
}));
