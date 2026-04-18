#!/usr/bin/env node

// review-all.mjs — 전체 문서 리뷰 통합 실행
// 4개 리뷰 스크립트를 순차 실행하고 종합 리포트 생성
// 사용법: node claude_temp/review-all.mjs

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const scripts = [
  { name: '문서 일관성', file: 'claude_temp/review-docs-consistency.mjs' },
  { name: '결정 사항', file: 'claude_temp/review-decisions.mjs' },
  { name: '개발 흐름', file: 'claude_temp/review-dev-flow.mjs' },
  { name: '방향성', file: 'claude_temp/review-direction.mjs' },
];

console.log('╔══════════════════════════════════════╗');
console.log('║     전체 문서 리뷰 리포트             ║');
console.log('╚══════════════════════════════════════╝\n');

const results = [];

for (const script of scripts) {
  if (!existsSync(script.file)) {
    console.log(`⚠ ${script.name}: ${script.file} 파일 없음 — 건너뜀\n`);
    results.push({ name: script.name, status: 'SKIP' });
    continue;
  }

  console.log(`${'─'.repeat(50)}`);
  try {
    const output = execSync(`node "${script.file}"`, { encoding: 'utf8', timeout: 30000 });
    console.log(output);
    results.push({ name: script.name, status: 'OK' });
  } catch (e) {
    console.log(`✗ ${script.name} 실행 실패: ${e.message}\n`);
    results.push({ name: script.name, status: 'FAIL' });
  }
}

// 종합
console.log('═'.repeat(50));
console.log('\n종합 결과:');
for (const r of results) {
  const icon = r.status === 'OK' ? '✓' : r.status === 'SKIP' ? '-' : '✗';
  console.log(`  [${icon}] ${r.name}: ${r.status}`);
}
console.log('\n에이전트는 이 리포트를 기반으로 의미적 판단을 추가로 수행하세요.');
