#!/usr/bin/env node

// review-decisions.mjs — 결정 사항 탈선 검토
// ADR, SRS/PRD의 결정이 Architecture/코드와 일치하는지 확인
// 사용법: node claude_temp/review-decisions.mjs

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const docsDir = 'docs/dev';
const adrDir = join(docsDir, 'adr');

console.log('=== 결정 사항 검토 ===\n');

// 1. ADR 수집
console.log('--- 1. ADR 목록 ---');
const adrs = [];
if (existsSync(adrDir)) {
  const files = readdirSync(adrDir).filter(f => f.endsWith('.md')).sort();
  for (const f of files) {
    const content = readFileSync(join(adrDir, f), 'utf8');
    const titleMatch = content.match(/^#\s+(.+)/m);
    const statusMatch = content.match(/상태|status/i);
    const title = titleMatch ? titleMatch[1] : f;
    adrs.push({ file: f, title });
    console.log(`  ${f}: ${title}`);
  }
  if (files.length === 0) console.log('  (ADR 없음)');
} else {
  console.log('  (ADR 디렉토리 없음)');
}

// 2. SRS/PRD 핵심 결정 추출
console.log('\n--- 2. SRS/PRD 주요 결정 ---');
const specFiles = ['SRS.md', 'PRD.md'].map(f => join(docsDir, f)).filter(existsSync);
const decisions = [];

for (const file of specFiles) {
  const content = readFileSync(file, 'utf8');
  // "결정", "선택", "채택", "사용한다", "적용한다" 패턴 추출
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/결정|선택|채택|사용한다|적용한다|must|shall/i.test(line) && line.trim().length > 10) {
      decisions.push({ file: basename(file), line: i + 1, text: line.trim().slice(0, 80) });
    }
  }
}

if (decisions.length > 0) {
  decisions.slice(0, 15).forEach(d => console.log(`  [${d.file}:${d.line}] ${d.text}`));
  if (decisions.length > 15) console.log(`  ... 외 ${decisions.length - 15}건`);
} else {
  console.log('  (SRS/PRD에서 결정 패턴 미발견 — 문서가 없거나 작성 전)');
}

// 3. Architecture 문서 존재 및 주요 구성 확인
console.log('\n--- 3. Architecture 문서 ---');
const archFile = join(docsDir, 'Architecture.md');
if (existsSync(archFile)) {
  const content = readFileSync(archFile, 'utf8');
  const sections = content.match(/^#{1,3}\s+.+/gm) || [];
  console.log(`  존재: ✓ (${sections.length}개 섹션)`);
  sections.slice(0, 10).forEach(s => console.log(`    ${s}`));
} else {
  console.log('  존재: ✗ (미작성)');
}

// 4. 기술 스택 일관성 (CLAUDE.md vs Architecture vs package.json)
console.log('\n--- 4. 기술 스택 교차 확인 ---');
const techSources = {};

if (existsSync('CLAUDE.md')) {
  const content = readFileSync('CLAUDE.md', 'utf8');
  const stackMatch = content.match(/기술\s*스택|tech\s*stack/i);
  techSources['CLAUDE.md'] = stackMatch ? '기술 스택 섹션 있음' : '기술 스택 미명시';
}

if (existsSync('package.json')) {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const deps = Object.keys(pkg.dependencies || {}).length;
    const devDeps = Object.keys(pkg.devDependencies || {}).length;
    techSources['package.json'] = `deps: ${deps}, devDeps: ${devDeps}`;
  } catch { techSources['package.json'] = '파싱 실패'; }
} else {
  techSources['package.json'] = '없음';
}

for (const [src, info] of Object.entries(techSources)) {
  console.log(`  ${src}: ${info}`);
}

// 5. 요약
console.log(`\n=== 검토 완료: ADR ${adrs.length}건, 결정 패턴 ${decisions.length}건 ===`);
console.log('주의: 이 스크립트는 구조적 검사만 수행합니다. 의미적 일치는 에이전트가 판단하세요.');
