#!/usr/bin/env node

// install.mjs — Docs OMC 통합 설치 스크립트
// 모든 OS에서 동작: node install.mjs
// 사전 조건: Node.js v18+, Git, Claude Code CLI

import { execSync, execFileSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';

const home = homedir();
const claudeDir = join(home, '.claude');
const hooksDir = join(claudeDir, 'hooks', 'docs-omc');
const rulesDir = join(claudeDir, 'rules');
const agentsDir = join(home, '.agents', 'skills');
const scriptDir = resolve(import.meta.url.replace('file:///', '').replace('file://', ''), '..');

function log(msg) { console.log(msg); }
function ok(msg) { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.log(`  ⚠ ${msg}`); }
function err(msg) { console.error(`  ✗ ${msg}`); }

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  ensureDir(dest);
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

log('=== Docs OMC 전역 설치 ===\n');

// ─── 1단계: OMC 설치 확인/설치 ───
log('[1/5] OMC 설치 확인...');
try {
  const plugins = execSync('claude plugin list 2>&1', { encoding: 'utf8', timeout: 10000 });
  if (plugins.includes('oh-my-claudecode')) {
    ok('OMC 이미 설치됨');
  } else {
    log('  OMC 설치 중...');
    execSync('claude plugin add oh-my-claudecode@omc', { stdio: 'inherit', timeout: 30000 });
    ok('OMC 설치 완료');
  }
} catch (e) {
  warn('OMC 설치 확인 실패. Claude Code CLI를 확인하세요.');
}

// ─── 2단계: 글로벌 Rules 배치 ───
log('[2/5] Rules 배치...');
ensureDir(rulesDir);
copyFileSync(join(scriptDir, 'rules', 'docs-omc.md'), join(rulesDir, 'docs-omc.md'));
ok('docs-omc.md 배치 완료');

// ─── 3단계: 사용자 훅 등록 ───
log('[3/5] 훅 등록...');
ensureDir(hooksDir);
for (const hook of ['session-start.mjs', 'pre-commit-check.mjs', 'post-save-mmd.mjs']) {
  copyFileSync(join(scriptDir, 'hooks', hook), join(hooksDir, hook));
}
ok('훅 파일 복사 완료');

try {
  execFileSync('node', [join(scriptDir, 'scripts', 'merge-hooks-config.mjs')], {
    encoding: 'utf8',
    timeout: 10000
  });
  ok('settings.json 훅 등록 완료');
} catch (e) {
  warn(`settings.json 훅 병합 실패: ${e.message}`);
}

// ─── 4단계: 사전 스킬 확인 ───
log('[4/5] 기본 스킬 확인...');
const findSkillsPath = join(home, '.agents', 'skills', 'find-skills', 'SKILL.md');
if (existsSync(findSkillsPath)) {
  ok('find-skills');
} else {
  warn('find-skills 스킬이 없습니다. OMC 설치를 확인하세요.');
}

const settingsPath = join(claudeDir, 'settings.json');
try {
  if (existsSync(settingsPath)) {
    const settings = readFileSync(settingsPath, 'utf8');
    if (settings.includes('"context7"')) {
      ok('context7');
    } else {
      warn('context7 MCP 서버가 설정되지 않았습니다.');
    }
  } else {
    warn('context7 MCP 서버가 설정되지 않았습니다.');
  }
} catch {
  warn('settings.json 확인 실패');
}

// ─── 5단계: 커스텀 스킬 설치 ───
log('[5/5] 스킬 설치...');
const skills = ['dev-init', 'dev-autopilot', 'security-report', 'test-report', 'performance-report', 'architecture-doc'];
for (const skill of skills) {
  const src = join(scriptDir, 'skills', skill);
  const dest = join(agentsDir, skill);
  copyRecursive(src, dest);
  ok(`${skill} 설치됨`);
}

log('\n=== 설치 완료 ===');
log('프로젝트 초기화: 프로젝트 디렉토리에서 /dev-init 실행');
