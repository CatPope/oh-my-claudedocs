#!/usr/bin/env node

// install.mjs — Docs OMC 통합 설치 스크립트
// 모든 OS에서 동작: node install.mjs
// 사전 조건: Node.js v18+, Git, Claude Code CLI

import { execSync, execFileSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, readFileSync, readdirSync, statSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';

// ─── 경로 설정 ───
const home = homedir();
const claudeDir = join(home, '.claude');
const hooksDir = join(claudeDir, 'hooks', 'docs-omc');
const rulesDir = join(claudeDir, 'rules');
const docsDir = join(claudeDir, 'docs');
const agentsDir = join(home, '.agents', 'skills');
const scriptDir = resolve(import.meta.url.replace('file:///', '').replace('file://', ''), '..');

// ─── 유틸리티 ───
function log(msg) { console.log(msg); }
function ok(msg) { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.log(`  ⚠ ${msg}`); }

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  ensureDir(dest);
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    statSync(srcPath).isDirectory()
      ? copyRecursive(srcPath, destPath)
      : copyFileSync(srcPath, destPath);
  }
}

// ─── Phase 1: OMC 플러그인 ───
function phaseOmc() {
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
  } catch {
    warn('OMC 설치 확인 실패. Claude Code CLI를 확인하세요.');
  }
}

// ─── Phase 2: Rules + 참조 문서 ───
function phaseRules() {
  log('[2/5] Rules 배치...');
  ensureDir(rulesDir);
  ensureDir(docsDir);
  copyFileSync(join(scriptDir, 'rules', 'docs-omc.md'), join(rulesDir, 'docs-omc.md'));
  copyFileSync(join(scriptDir, 'rules', 'docs-omc-ref.md'), join(docsDir, 'docs-omc-ref.md'));
  ok(`docs-omc.md → rules/, docs-omc-ref.md → docs/ ${isUpdate ? '갱신' : '배치'} 완료`);
}

// ─── Phase 3: 훅 등록 ───
const HOOK_FILES = [
  '_parse-input.mjs', 'session-start.mjs', 'pre-commit-check.mjs',
  'post-save-mmd.mjs', 'post-doc-toc-sync.mjs', 'post-doc-header-validate.mjs',
  'pre-compact.mjs', 'post-compact.mjs', 'intent-drift-check.mjs', 'doc-update-check.mjs',
  'claude-md-limit.mjs', 'conventional-commit.mjs', 'docs-header-check.mjs', 'pr-push-check.mjs',
];

function phaseHooks() {
  log('[3/5] 훅 등록...');
  ensureDir(hooksDir);
  for (const hook of HOOK_FILES) {
    copyFileSync(join(scriptDir, 'hooks', hook), join(hooksDir, hook));
  }
  ok(`훅 파일 ${isUpdate ? '갱신' : '복사'} 완료`);

  try {
    execFileSync('node', [join(scriptDir, 'scripts', 'merge-hooks-config.mjs')], {
      encoding: 'utf8', timeout: 10000,
    });
    ok('settings.json 훅 등록 완료');
  } catch (e) {
    warn(`settings.json 훅 병합 실패: ${e.message}`);
  }
}

// ─── Phase 4: 사전 스킬/MCP 확인 ───
function phasePrecheck() {
  log('[4/5] 기본 스킬 확인...');

  const findSkillsPath = join(agentsDir, 'find-skills', 'SKILL.md');
  existsSync(findSkillsPath) ? ok('find-skills') : warn('find-skills 스킬이 없습니다. OMC 설치를 확인하세요.');

  const mcpConfigPaths = [join(claudeDir, 'settings.json'), join(home, '.claude.json')];
  const context7Found = mcpConfigPaths.some(p => {
    try { return existsSync(p) && readFileSync(p, 'utf8').includes('"context7"'); }
    catch { return false; }
  });
  context7Found ? ok('context7') : warn('context7 MCP 서버가 설정되지 않았습니다.');
}

// ─── Phase 5: 커스텀 스킬 설치 ───
const SKILLS = [
  'dev-init', 'docs-init', 'dev-team', 'security-report',
  'test-report', 'performance-report', 'architecture-doc', 'docs-reviewer', 'docs-writer',
];

function phaseSkills() {
  log('[5/5] 스킬 설치...');
  for (const skill of SKILLS) {
    const dest = join(agentsDir, skill);
    if (isUpdate && existsSync(dest)) {
      rmSync(dest, { recursive: true, force: true });
    }
    copyRecursive(join(scriptDir, 'skills', skill), dest);
    ok(`${skill} ${isUpdate ? '갱신' : '설치'}됨`);
  }
}

// ─── 실행 ───
const isUpdate = existsSync(join(hooksDir, 'session-start.mjs'));
log(`=== Docs OMC 전역 ${isUpdate ? '업데이트' : '설치'} ===\n`);

phaseOmc();
phaseRules();
phaseHooks();
phasePrecheck();
phaseSkills();

log(`\n=== ${isUpdate ? '업데이트' : '설치'} 완료 ===`);
log('프로젝트 초기화: 프로젝트 디렉토리에서 /dev-init 실행');
