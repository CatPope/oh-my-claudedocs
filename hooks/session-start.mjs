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
  const skillPath = join(home, '.claude', 'skills', 'find-skills', 'SKILL.md');
  if (!existsSync(skillPath)) {
    warnings.push('find-skills 스킬이 없습니다. OMC 설치를 확인하세요.');
  }
} catch {
  warnings.push('find-skills 확인 실패.');
}

// 3. context7 MCP 확인 (전역 ~/.claude.json → 로컬 .mcp.json)
let context7Found = false;
try {
  const { readFileSync, existsSync } = await import('fs');
  const { join } = await import('path');
  const home = process.env.HOME || process.env.USERPROFILE || '';

  // 전역: ~/.claude.json (claude mcp add로 등록된 MCP)
  const globalConfig = join(home, '.claude.json');
  if (existsSync(globalConfig)) {
    const config = JSON.parse(readFileSync(globalConfig, 'utf8'));
    if (config.mcpServers && config.mcpServers.context7) {
      context7Found = true;
    }
  }

  // 로컬: .mcp.json
  if (!context7Found) {
    const localMcp = '.mcp.json';
    if (existsSync(localMcp)) {
      const mcpJson = readFileSync(localMcp, 'utf8');
      if (mcpJson.includes('"context7"')) {
        context7Found = true;
      }
    }
  }
} catch { /* 파일 읽기 실패 시 무시 */ }

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
