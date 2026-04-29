#!/usr/bin/env node

// check-doc-status.mjs — 필수/선택 문서 존재 여부 + 날짜 파일명 검증
// 사용법: node claude_temp/check-doc-status.mjs

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const docsDir = 'docs/dev';

const REQUIRED_AUTO = ['Architecture.md'];
const REQUIRED_FINAL = [
  'db-schema.md', 'api-spec.md', 'env-guide.md',
  'deploy-guide.md', 'limitations.md', 'README.md'
];
const DISCUSS_REQUIRED = ['test-plan.md'];
const DATE_DIRS = {
  'test-results': /^test-\d{4}-\d{2}-\d{2}\.md$/,
  'performance': /^performance-\d{4}-\d{2}-\d{2}\.md$/,
  'security-checklist': /^security-checklist-\d{4}-\d{2}-\d{2}\.md$/,
};

console.log('=== 문서 상태 점검 ===\n');

// SRS 또는 PRD 확인
const hasSRS = existsSync(join(docsDir, 'SRS.md'));
const hasPRD = existsSync(join(docsDir, 'PRD.md'));
console.log(`[논의 필수] SRS/PRD: ${hasSRS ? '✓ SRS' : hasPRD ? '✓ PRD' : '✗ 없음'}`);

// STP
const hasSTP = existsSync(join(docsDir, 'STP.md'));
console.log(`[논의 필수] STP: ${hasSTP ? '✓' : '✗'}`);

// 논의 필수
for (const doc of DISCUSS_REQUIRED) {
  const exists = existsSync(join(docsDir, doc));
  console.log(`[논의 필수] ${doc}: ${exists ? '✓' : '✗'}`);
}

// 필수 자동
for (const doc of REQUIRED_AUTO) {
  const exists = existsSync(join(docsDir, doc));
  console.log(`[필수 자동] ${doc}: ${exists ? '✓' : '✗'}`);
}

// 필수 최종
for (const doc of REQUIRED_FINAL) {
  const path = doc === 'README.md' ? 'README.md' : join(docsDir, doc);
  const exists = existsSync(path);
  console.log(`[필수 최종] ${doc}: ${exists ? '✓' : '✗'}`);
}

// 선택
const hasGTM = existsSync(join(docsDir, 'GTM.md'));
const hasDetailedSpec = existsSync(join(docsDir, 'DetailedSpec.md'));
console.log(`[선택] GTM: ${hasGTM ? '✓' : '-'}`);
console.log(`[선택] DetailedSpec: ${hasDetailedSpec ? '✓' : '-'}`);

// ADR
const adrDir = join(docsDir, 'adr');
const adrCount = existsSync(adrDir)
  ? readdirSync(adrDir).filter(f => f.endsWith('.md')).length
  : 0;
console.log(`[상시] ADR: ${adrCount}개`);

// 날짜별 파일 검증
console.log('\n--- 날짜별 파일 ---');
for (const [dir, pattern] of Object.entries(DATE_DIRS)) {
  const dirPath = join(docsDir, dir);
  if (!existsSync(dirPath)) {
    console.log(`${dir}/: 디렉토리 없음`);
    continue;
  }
  const files = readdirSync(dirPath).filter(f => f.endsWith('.md'));
  const valid = files.filter(f => pattern.test(f));
  const invalid = files.filter(f => !pattern.test(f));
  console.log(`${dir}/: ${valid.length}개 정상${invalid.length > 0 ? `, ${invalid.length}개 이름 규약 위반 (${invalid.join(', ')})` : ''}`);
}
