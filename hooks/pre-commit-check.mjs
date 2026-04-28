// pre-commit-check.mjs — PreToolUse/Bash 훅
// git commit 감지 시 린트/포맷 실행. 실패하면 커밋 차단.

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parseHookInput, pass, block, GIT_COMMIT_RE } from './_parse-input.mjs';

const input = await parseHookInput();
if (!input) pass();

const command = input.toolInput?.command || '';
const isGitCommit = GIT_COMMIT_RE.test(command);

if (!isGitCommit) pass();

// 프로젝트 루트에서 린트/포맷 도구 탐색
const cwd = process.cwd();
const errors = [];

try {
  // package.json 확인
  const pkgPath = join(cwd, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const scripts = pkg.scripts || {};

    // lint 실행
    if (scripts.lint) {
      try {
        execSync('npm run lint', { cwd, encoding: 'utf8', timeout: 8000, stdio: 'pipe' });
      } catch (e) {
        errors.push(`린트 실패:\n${e.stdout || e.stderr || e.message}`);
      }
    }

    // format 확인 (format:check 또는 format --check)
    if (scripts['format:check']) {
      try {
        execSync('npm run format:check', { cwd, encoding: 'utf8', timeout: 8000, stdio: 'pipe' });
      } catch (e) {
        errors.push(`포맷 확인 실패:\n${e.stdout || e.stderr || e.message}`);
      }
    } else if (scripts.format) {
      try {
        execSync('npm run format -- --check', { cwd, encoding: 'utf8', timeout: 8000, stdio: 'pipe' });
      } catch (e) {
        errors.push(`포맷 확인 실패:\n${e.stdout || e.stderr || e.message}`);
      }
    }
  }
} catch {
  // package.json 파싱 실패 등은 무시하고 커밋 허용
}

if (errors.length > 0) {
  block(`[Docs OMC] 커밋 차단 — 린트/포맷 오류를 수정 후 다시 커밋하세요:\n\n${errors.join('\n\n')}`);
} else {
  pass();
}
