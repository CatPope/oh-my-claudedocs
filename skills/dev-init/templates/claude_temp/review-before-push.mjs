#!/usr/bin/env node

// review-before-push.mjs — push 전 변경사항 자체 리뷰 리포트 생성
// 사용법: node claude_temp/review-before-push.mjs [base-branch]
// 예: node claude_temp/review-before-push.mjs master

import { execSync } from 'child_process';

const base = process.argv[2] || 'master';

console.log(`=== Push 전 리뷰 리포트 ===\n`);
console.log(`비교 대상: ${base}...HEAD\n`);

// 1. 변경 파일 목록
let diffStat;
try {
  diffStat = execSync(`git diff ${base}...HEAD --stat`, { encoding: 'utf8' });
} catch {
  diffStat = execSync('git diff --cached --stat', { encoding: 'utf8' });
}
console.log('--- 변경 파일 ---');
console.log(diffStat || '(변경 없음)');

// 2. 커밋 목록
let commits;
try {
  commits = execSync(`git log ${base}...HEAD --oneline`, { encoding: 'utf8' });
} catch {
  commits = execSync('git log -5 --oneline', { encoding: 'utf8' });
}
console.log('--- 커밋 목록 ---');
console.log(commits || '(커밋 없음)');

// 3. Conventional Commits 형식 검증
const TYPES = ['feat', 'fix', 'docs', 'refactor', 'chore', 'test', 'style', 'perf', 'ci', 'build', 'revert'];
const pattern = new RegExp(`^[a-f0-9]+ (${TYPES.join('|')})(\\([a-z][a-z0-9-]*\\))?(!)?:\\s+.+$`);
const commitLines = (commits || '').trim().split('\n').filter(Boolean);
const badCommits = commitLines.filter(line => !pattern.test(line));
if (badCommits.length > 0) {
  console.log('\n⚠ Conventional Commits 위반:');
  badCommits.forEach(c => console.log(`  ✗ ${c}`));
} else if (commitLines.length > 0) {
  console.log('\n✓ 모든 커밋 Conventional Commits 준수');
}

// 4. 변경 파일 분류
const changedFiles = execSync(`git diff ${base}...HEAD --name-only`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

const categories = {
  hooks: [], rules: [], skills: [], scripts: [], docs: [], ci: [], other: []
};
for (const f of changedFiles) {
  if (f.startsWith('hooks/')) categories.hooks.push(f);
  else if (f.startsWith('rules/') || f.includes('/rules/')) categories.rules.push(f);
  else if (f.startsWith('skills/')) categories.skills.push(f);
  else if (f.startsWith('scripts/')) categories.scripts.push(f);
  else if (f.startsWith('docs/') || f === 'README.md') categories.docs.push(f);
  else if (f.startsWith('.github/')) categories.ci.push(f);
  else categories.other.push(f);
}

console.log('\n--- 변경 분류 ---');
for (const [cat, files] of Object.entries(categories)) {
  if (files.length > 0) {
    console.log(`${cat}: ${files.length}개 (${files.join(', ')})`);
  }
}

// 5. PR 체크리스트 자동 판정
console.log('\n--- PR 체크리스트 ---');

// CLAUDE.md 줄 수
try {
  const { readFileSync, existsSync } = await import('fs');
  if (existsSync('CLAUDE.md')) {
    const lines = readFileSync('CLAUDE.md', 'utf8').split('\n').length;
    console.log(`[${lines <= 300 ? '✓' : '✗'}] CLAUDE.md ${lines}줄 (제한: 300줄)`);
  }
} catch { /* skip */ }

// JS 구문 검증
const jsFiles = changedFiles.filter(f => f.endsWith('.mjs') || f.endsWith('.js'));
if (jsFiles.length > 0) {
  let syntaxOk = true;
  for (const f of jsFiles) {
    try {
      execSync(`node --check ${f}`, { encoding: 'utf8', stdio: 'pipe' });
    } catch {
      console.log(`[✗] 구문 오류: ${f}`);
      syntaxOk = false;
    }
  }
  if (syntaxOk) console.log(`[✓] JS 구문 검증 통과 (${jsFiles.length}개)`);
}

// 열린 PR 확인
try {
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  const prJson = execSync(`gh pr list --state open --head "${branch}" --json number,title`, { encoding: 'utf8', timeout: 5000 });
  const prs = JSON.parse(prJson);
  if (prs.length > 0) {
    prs.forEach(pr => console.log(`[✓] 열린 PR: #${pr.number} ${pr.title}`));
  } else {
    console.log(`[!] 브랜치 '${branch}'에 열린 PR 없음 — 새 PR 생성 필요`);
  }
} catch {
  console.log('[!] PR 확인 실패');
}

console.log('\n=== 리뷰 완료 ===');
