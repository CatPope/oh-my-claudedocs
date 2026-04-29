// session-start.mjs — SessionStart 훅
// OMC, find-skills, context7 존재 확인. 없으면 경고.

import { execSync } from 'child_process';

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
// SessionStart 훅은 input이 없을 수 있지만 프로토콜 준수를 위해 읽는다
// JSON 파싱은 불필요 — 이 훅은 입력 데이터를 사용하지 않음

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

// 3. context7 MCP 확인 (전역 → 로컬 순서)
let context7Found = false;
try {
  const mcpOutput = execSync('claude mcp list 2>&1', { encoding: 'utf8', timeout: 10000 });
  if (mcpOutput.includes('context7')) {
    context7Found = true;
  }
} catch { /* claude mcp list 실패 — 로컬 확인으로 fallback */ }

if (!context7Found) {
  try {
    const { readFileSync, existsSync } = await import('fs');
    const localMcp = '.mcp.json';
    if (existsSync(localMcp)) {
      const mcpJson = readFileSync(localMcp, 'utf8');
      if (mcpJson.includes('"context7"')) {
        context7Found = true;
      }
    }
  } catch { /* .mcp.json 읽기 실패 */ }
}

if (!context7Found) {
  warnings.push('context7 MCP 서버가 설정되지 않았습니다. 설치: https://context7.com/');
}

if (warnings.length > 0) {
  console.log(JSON.stringify({
    continue: true,
    systemMessage: `[Docs OMC] 경고:\n${warnings.map(w => `- ${w}`).join('\n')}`
  }));
} else {
  console.log(JSON.stringify({ continue: true }));
}
