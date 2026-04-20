// intent-drift-check.mjs — PreToolUse 훅
// 자동화 워크플로우(dev-team/ralph) 실행 중 원래 요청에서 이탈하는지 점검.
// .omc/state/ralph-state.json 또는 team-state.json이 없으면 조용히 통과.
// 15번의 툴 호출마다 한 번씩 점검 메시지를 출력한다.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { parseHookInput, pass, info } from './_parse-input.mjs';

const input = await parseHookInput();
if (!input) pass();

const cwd = process.cwd();
const stateDir = join(cwd, '.omc', 'state');
const ralphStatePath = join(stateDir, 'ralph-state.json');
const teamStatePath = join(stateDir, 'team-state.json');

// 자동화 워크플로우가 활성화된 경우에만 동작
const isActive = existsSync(ralphStatePath) || existsSync(teamStatePath);
if (!isActive) pass();

// 카운터 파일 경로
const counterPath = join(stateDir, 'drift-counter.json');
const THRESHOLD = 15;

// 카운터 읽기/갱신
let counter = 0;
try {
  if (existsSync(counterPath)) {
    const raw = readFileSync(counterPath, 'utf8');
    counter = JSON.parse(raw).count ?? 0;
  }
} catch {
  counter = 0;
}

counter += 1;

try {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(counterPath, JSON.stringify({ count: counter }), 'utf8');
} catch {
  // 카운터 쓰기 실패 시 무시하고 통과
  pass();
}

// THRESHOLD에 도달하지 않은 경우 통과
if (counter % THRESHOLD !== 0) pass();

// 원래 태스크 설명 읽기 (ralph-state 우선, 없으면 team-state)
let originalTask = '';
try {
  const statePath = existsSync(ralphStatePath) ? ralphStatePath : teamStatePath;
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  originalTask = state.task || state.originalTask || state.goal || '';
} catch {
  // 상태 파일 읽기 실패 시 태스크 없이 일반 메시지 출력
}

const taskSnippet = originalTask
  ? `'${originalTask.slice(0, 120)}${originalTask.length > 120 ? '...' : ''}'`
  : '(원래 요청 확인 불가)';

const systemMessage =
  `[Docs OMC] 시나리오 이탈 점검 (${counter}번째 툴 호출): ` +
  `현재 작업이 원래 요청 ${taskSnippet}과 일치하는지 확인하라. ` +
  `수정 중인 파일, 변경 내용, 원래 요청과의 연관성을 점검하라. ` +
  `불일치가 감지되면 즉시 작업을 중단하고 사용자에게 보고한 뒤 방향을 재설정하라.`;

info(systemMessage);
