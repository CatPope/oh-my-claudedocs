#!/usr/bin/env node

// review-docs-consistency.mjs — 전체 문서 일관성 검토
// 용어, 네이밍, 상호 참조 정합성 확인
// 사용법: node claude_temp/review-docs-consistency.mjs

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const docsDir = 'docs/dev';

function collectMdFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectMdFiles(full));
    } else if (entry.endsWith('.md') && !entry.endsWith('.template.md')) {
      results.push(full);
    }
  }
  return results;
}

// 프로젝트 루트 문서 포함
const rootDocs = ['README.md', 'CLAUDE.md'].filter(f => existsSync(f));
const allFiles = [...rootDocs, ...collectMdFiles(docsDir)];

if (allFiles.length === 0) {
  console.log('검사 대상 .md 파일이 없습니다.');
  process.exit(0);
}

console.log('=== 문서 일관성 검토 ===\n');

// 1. 프로젝트 이름 일관성
const PROJECT_NAMES = ['oh-my-claudedocs', 'omcd'];
const OLD_NAMES = ['docs-omc', 'Docs OMC', 'docsOmc', 'docs_omc'];
const nameIssues = [];

for (const file of allFiles) {
  const content = readFileSync(file, 'utf8');
  for (const old of OLD_NAMES) {
    if (content.includes(old)) {
      const count = content.split(old).length - 1;
      nameIssues.push({ file, old, count });
    }
  }
}

console.log('--- 1. 프로젝트 이름 일관성 ---');
if (nameIssues.length === 0) {
  console.log('✓ 레거시 이름 잔존 없음');
} else {
  nameIssues.forEach(i => console.log(`✗ ${i.file}: '${i.old}' ${i.count}회`));
}

// 2. 상호 참조 정합성 (문서 내 파일 참조가 실제 존재하는지)
const refPattern = /(?:docs\/dev\/|\.\/|\.\.\/)([\w/.-]+\.md)/g;
const brokenRefs = [];

for (const file of allFiles) {
  const content = readFileSync(file, 'utf8');
  let match;
  while ((match = refPattern.exec(content)) !== null) {
    const refPath = match[0].startsWith('.') ? join(file, '..', match[0]) : match[0];
    if (!existsSync(refPath)) {
      brokenRefs.push({ from: file, ref: match[0] });
    }
  }
}

console.log('\n--- 2. 상호 참조 정합성 ---');
if (brokenRefs.length === 0) {
  console.log('✓ 깨진 문서 참조 없음');
} else {
  brokenRefs.forEach(r => console.log(`✗ ${r.from} → ${r.ref} (파일 없음)`));
}

// 3. 용어 일관성 (같은 개념에 다른 표기)
const TERM_GROUPS = [
  { canonical: '하네스', variants: ['harness', '하니스'] },
  { canonical: 'Rules', variants: ['규칙 파일', '룰 파일', '룰즈'] },
  { canonical: '거버넌스', variants: ['governance', '가버넌스'] },
  { canonical: 'test-plan', variants: ['테스트 계획서', '테스트계획', 'testplan'] },
];

const termIssues = [];
for (const file of allFiles) {
  const content = readFileSync(file, 'utf8').toLowerCase();
  for (const group of TERM_GROUPS) {
    for (const variant of group.variants) {
      if (content.includes(variant.toLowerCase())) {
        termIssues.push({ file, canonical: group.canonical, found: variant });
      }
    }
  }
}

console.log('\n--- 3. 용어 일관성 ---');
if (termIssues.length === 0) {
  console.log('✓ 비표준 용어 없음');
} else {
  termIssues.forEach(t => console.log(`! ${t.file}: '${t.found}' → '${t.canonical}' 권장`));
}

// 4. 요약
const totalIssues = nameIssues.length + brokenRefs.length + termIssues.length;
console.log(`\n=== 검토 완료: ${allFiles.length}개 파일, ${totalIssues}건 이슈 ===`);
