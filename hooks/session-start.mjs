// session-start.mjs — SessionStart 훅
// OMC, find-skills, context7 존재 확인. 없으면 경고.

import { execSync } from 'child_process';
import { parseHookInput, pass, info } from './_parse-input.mjs';

// SessionStart 훅은 input이 없을 수 있지만 프로토콜 준수를 위해 읽는다
// JSON 파싱 결과는 이 훅에서 사용하지 않음
await parseHookInput();

const warnings = [];

// 1. OMC 플러그인 확인
try {
  const plugins = execSync('claude plugin list 2>&1', { encoding: 'utf8', timeout: 3000 });
  if (!plugins.includes('oh-my-claudecode')) {
    warnings.push('OMC 플러그인이 설치되지 않았습니다. 설치: claude plugin add oh-my-claudecode@omc');
  }
} catch {
  warnings.push('OMC 플러그인 확인 실패. Claude Code CLI를 확인하세요.');
}

// 2. find-skills 스킬 확인
try {
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const skillPath = join(home, '.agents', 'skills', 'find-skills', 'SKILL.md');
  if (!existsSync(skillPath)) {
    warnings.push('find-skills 스킬이 없습니다. OMC 설치를 확인하세요.');
  }
} catch {
  warnings.push('find-skills 확인 실패.');
}

// 3. context7 MCP 확인 (settings.json 또는 ~/.claude.json)
try {
  const { readFileSync, existsSync } = await import('fs');
  const { join } = await import('path');
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const mcpConfigPaths = [
    join(home, '.claude', 'settings.json'),
    join(home, '.claude.json'),
  ];
  const found = mcpConfigPaths.some(p => {
    try {
      return existsSync(p) && readFileSync(p, 'utf8').includes('"context7"');
    } catch { return false; }
  });
  if (!found) {
    warnings.push('context7 MCP 서버가 설정되지 않았습니다.');
  }
} catch {
  // 설정 파일 확인 실패 시 무시
}

if (warnings.length > 0) {
  info(`[Docs OMC] 경고:\n${warnings.map(w => `- ${w}`).join('\n')}`);
} else {
  pass();
}
