// pre-compact.mjs — PreCompact 훅
// compact 전에 .claudeignore를 임시 해제하여 모든 문서에 접근 가능하게 한다

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseHookInput, info } from './_parse-input.mjs';

await parseHookInput();

// .claudeignore를 임시 해제: 백업 후 초기화
const projectRoot = process.cwd();
const claudeignorePath = join(projectRoot, '.claudeignore');
const claudeignoreBackupPath = join(projectRoot, '.claudeignore.backup');

if (existsSync(claudeignorePath)) {
  const content = readFileSync(claudeignorePath, 'utf8');
  writeFileSync(claudeignoreBackupPath, content, 'utf8');
  writeFileSync(claudeignorePath, '', 'utf8');
}

info('[Docs OMC] compact 전 .claudeignore 임시 해제 완료. 모든 문서에 접근 가능하다.');
