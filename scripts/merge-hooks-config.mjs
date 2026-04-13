// merge-hooks-config.mjs — settings.json에 Docs OMC 훅을 안전 병합
// 기존 설정 보존, 동일 이벤트에 append, 중복 방지 (멱등성)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const home = process.env.HOME || process.env.USERPROFILE || '';
const claudeDir = join(home, '.claude');
const settingsPath = join(claudeDir, 'settings.json');

// Docs OMC 훅 정의
const hooksDir = join(home, '.claude', 'hooks', 'docs-omc');
const docsOmcHooks = {
  SessionStart: [
    {
      matcher: '',
      hooks: [{
        type: 'command',
        command: `node ${hooksDir}/session-start.mjs`.replace(/\\/g, '/'),
        timeout: 5
      }]
    }
  ],
  PreToolUse: [
    {
      matcher: 'Bash',
      hooks: [{
        type: 'command',
        command: `node ${hooksDir}/pre-commit-check.mjs`.replace(/\\/g, '/'),
        timeout: 10
      }]
    }
  ],
  PostToolUse: [
    {
      matcher: 'Write',
      hooks: [{
        type: 'command',
        command: `node ${hooksDir}/post-save-mmd.mjs`.replace(/\\/g, '/'),
        timeout: 15
      }]
    }
  ],
  PreCompact: [
    {
      matcher: '',
      hooks: [{
        type: 'command',
        command: `node ${hooksDir}/pre-compact.mjs`.replace(/\\/g, '/'),
        timeout: 5
      }]
    }
  ],
  PostCompact: [
    {
      matcher: '',
      hooks: [{
        type: 'command',
        command: `node ${hooksDir}/post-compact.mjs`.replace(/\\/g, '/'),
        timeout: 5
      }]
    }
  ]
};

// 1. 기존 settings.json 읽기 (없으면 빈 객체)
let settings = {};
if (existsSync(settingsPath)) {
  try {
    const raw = readFileSync(settingsPath, 'utf8');
    // JSONC 지원: 단일행 주석, 인라인 주석, 블록 주석 제거
    const cleaned = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')          // /* block */ 주석
      .replace(/^\s*\/\/.*$/gm, '')              // 전체 행 // 주석
      .replace(/(?<=")([^"]*)".*?\/\/.*$/gm, '$1"'); // 인라인 // 주석 (문자열 뒤)
    settings = JSON.parse(cleaned);
  } catch (e) {
    console.error(`settings.json 파싱 실패: ${e.message}`);
    console.error('기존 파일을 백업하고 새로 생성합니다.');
    const backupPath = `${settingsPath}.backup.${Date.now()}`;
    writeFileSync(backupPath, readFileSync(settingsPath));
    console.log(`백업: ${backupPath}`);
  }
}

// 2. hooks 섹션 초기화
if (!settings.hooks) {
  settings.hooks = {};
}

// 3. 각 이벤트별로 append (중복 방지)
for (const [event, entries] of Object.entries(docsOmcHooks)) {
  if (!settings.hooks[event]) {
    settings.hooks[event] = [];
  }

  for (const newEntry of entries) {
    // 중복 확인: 모든 hook command를 비교
    const newCommands = new Set(newEntry.hooks.map(h => h.command));
    const isDuplicate = settings.hooks[event].some(existing =>
      existing.hooks?.some(h => newCommands.has(h.command))
    );

    if (!isDuplicate) {
      settings.hooks[event].push(newEntry);
    }
  }
}

// 4. 저장
if (!existsSync(claudeDir)) {
  mkdirSync(claudeDir, { recursive: true });
}
writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
console.log(`settings.json 훅 병합 완료: ${settingsPath}`);
