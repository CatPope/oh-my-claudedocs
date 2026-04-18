#!/usr/bin/env node

// review-dev-flow.mjs — 현재 개발 흐름 검토
// 개발 단계 vs 문서 완성도, 갱신 필요 문서 식별
// 사용법: node claude_temp/review-dev-flow.mjs

import { existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const docsDir = 'docs/dev';

console.log('=== 개발 흐름 검토 ===\n');

// 1. 개발 단계 추정 (문서 존재 여부 기반)
const STAGES = [
  {
    name: '기획',
    required: ['SRS.md', 'PRD.md'],  // 하나만 있으면 됨
    mode: 'any',
    docs: ['STP.md', 'GTM.md'],
  },
  {
    name: '설계',
    required: ['Architecture.md'],
    mode: 'all',
    docs: ['DetailedSpec.md'],
  },
  {
    name: '테스트',
    required: ['test-plan.md'],
    mode: 'all',
    docs: [],
  },
  {
    name: '최종',
    required: ['db-schema.md', 'api-spec.md', 'env-guide.md', 'deploy-guide.md'],
    mode: 'all',
    docs: ['limitations.md'],
  },
];

console.log('--- 1. 개발 단계 추정 ---');
let currentStage = '초기화';
for (const stage of STAGES) {
  const check = stage.mode === 'any'
    ? stage.required.some(f => existsSync(join(docsDir, f)))
    : stage.required.every(f => existsSync(join(docsDir, f)));
  if (check) {
    currentStage = stage.name;
  }
}
console.log(`  현재 단계: [${currentStage}]\n`);

// 2. 문서 완성도 매트릭스
console.log('--- 2. 문서 완성도 ---');
const allDocs = [
  { name: 'SRS.md', stage: '기획', type: '논의 필수 (택1)' },
  { name: 'PRD.md', stage: '기획', type: '논의 필수 (택1)' },
  { name: 'STP.md', stage: '기획', type: '논의 필수' },
  { name: 'GTM.md', stage: '기획', type: '논의 선택' },
  { name: 'Architecture.md', stage: '설계', type: '필수 자동' },
  { name: 'DetailedSpec.md', stage: '설계', type: '선택' },
  { name: 'test-plan.md', stage: '테스트', type: '논의 필수' },
  { name: 'db-schema.md', stage: '최종', type: '필수 최종' },
  { name: 'api-spec.md', stage: '최종', type: '필수 최종' },
  { name: 'env-guide.md', stage: '최종', type: '필수 최종' },
  { name: 'deploy-guide.md', stage: '최종', type: '필수 최종' },
  { name: 'limitations.md', stage: '최종', type: '필수 최종' },
];

for (const doc of allDocs) {
  const path = join(docsDir, doc.name);
  const exists = existsSync(path);
  let lastMod = '';
  if (exists) {
    const mtime = statSync(path).mtime;
    lastMod = mtime.toISOString().split('T')[0];
  }
  const icon = exists ? '✓' : '✗';
  console.log(`  [${icon}] ${doc.name.padEnd(20)} ${doc.stage.padEnd(6)} ${doc.type}${lastMod ? ` (${lastMod})` : ''}`);
}

// 3. 최근 코드 변경 vs 문서 변경 비교
console.log('\n--- 3. 코드 vs 문서 최근 변경 ---');
try {
  const gitEnv = { ...process.env, LC_ALL: 'C.UTF-8', LANG: 'C.UTF-8' };
  const codeCommits = execSync('git log --oneline -5 -- "*.js" "*.mjs" "*.ts" "*.json"', { encoding: 'utf8', env: gitEnv, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  const docCommits = execSync('git log --oneline -5 -- "docs/" "*.md"', { encoding: 'utf8', env: gitEnv, stdio: ['pipe', 'pipe', 'pipe'] }).trim();

  console.log('  최근 코드 커밋:');
  (codeCommits || '(없음)').split('\n').forEach(l => console.log(`    ${l}`));
  console.log('  최근 문서 커밋:');
  (docCommits || '(없음)').split('\n').forEach(l => console.log(`    ${l}`));
} catch {
  console.log('  (git log 실패)');
}

// 4. 날짜별 리포트 최신성
console.log('\n--- 4. 리포트 최신성 ---');
const reportDirs = ['test-results', 'performance', 'security-checklist'];
for (const dir of reportDirs) {
  const path = join(docsDir, dir);
  if (!existsSync(path)) {
    console.log(`  ${dir}/: 없음`);
    continue;
  }
  const files = readdirSync(path).filter(f => f.endsWith('.md')).sort();
  const latest = files[files.length - 1] || '(없음)';
  console.log(`  ${dir}/: ${files.length}개, 최신: ${latest}`);
}

// 5. 요약
console.log(`\n=== 현재 단계: [${currentStage}] — 다음 단계 문서 준비 상태를 확인하세요 ===`);
