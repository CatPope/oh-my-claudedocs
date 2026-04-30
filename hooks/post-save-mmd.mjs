// post-save-mmd.mjs — PostToolUse/Write 훅
// .mmd 파일 저장 시 mmdc로 PNG 변환

import { execFileSync } from 'child_process';
import { parseHookInput, pass, info } from './_parse-input.mjs';

const input = await parseHookInput();
if (!input) pass();

const filePath = input.toolInput?.file_path || '';

if (filePath.endsWith('.mmd')) {
  try {
    const outPath = filePath.replace(/\.mmd$/, '.png');
    execFileSync('npx', ['mmdc', '-i', filePath, '-o', outPath], {
      timeout: 12000,
      stdio: 'pipe'
    });
    info(`Mermaid 다이어그램 변환 완료: ${filePath} → ${outPath}`);
  } catch (e) {
    info(`경고: Mermaid 변환 실패 (${filePath}). mmdc가 설치되어 있는지 확인하세요.`);
  }
} else {
  pass();
}
