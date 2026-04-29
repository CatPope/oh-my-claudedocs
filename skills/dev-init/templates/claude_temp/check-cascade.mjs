#!/usr/bin/env node

// check-cascade.mjs — 연쇄 갱신 대상 확인
// 사용법: node claude_temp/check-cascade.mjs [변경된 파일 경로]
// 예: node claude_temp/check-cascade.mjs docs/dev/SRS.md

import { basename } from 'path';

const file = process.argv[2];
if (!file) {
  console.log('사용법: node claude_temp/check-cascade.mjs <변경된 파일 경로>');
  process.exit(1);
}

const name = basename(file).toLowerCase();

const CASCADE_MAP = {
  'srs': ['Architecture.md', 'DetailedSpec.md', 'test-plan.md'],
  'prd': ['Architecture.md', 'DetailedSpec.md', 'test-plan.md'],
  'architecture': ['DetailedSpec.md', 'test-plan.md'],
};

const triggers = Object.entries(CASCADE_MAP);
const matched = [];

for (const [trigger, targets] of triggers) {
  if (name.includes(trigger.toLowerCase())) {
    matched.push(...targets);
  }
}

if (matched.length === 0) {
  console.log(`✓ '${basename(file)}' 변경 시 연쇄 갱신 대상 없음`);
} else {
  const unique = [...new Set(matched)];
  console.log(`⚠ '${basename(file)}' 변경 → 다음 문서 갱신 필요 여부 확인:`);
  unique.forEach(t => console.log(`  - docs/dev/${t}`));
  console.log('\n자동 갱신하지 않음. 사용자 확인 후 진행하세요.');
}
