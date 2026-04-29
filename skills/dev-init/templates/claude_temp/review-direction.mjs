#!/usr/bin/env node

// review-direction.mjs — 미래 개발 방향성 검토
// STP/GTM 기준 대비 현재 코드/문서 방향 이탈 여부 확인
// 사용법: node claude_temp/review-direction.mjs

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const docsDir = 'docs/dev';

console.log('=== 방향성 검토 ===\n');

// 1. STP 핵심 요약 추출
console.log('--- 1. STP (전략적 포지셔닝) ---');
const stpFile = join(docsDir, 'STP.md');
if (existsSync(stpFile)) {
  const content = readFileSync(stpFile, 'utf8');
  const lines = content.split('\n');
  // 세그먼트, 타겟, 포지셔닝 키워드 추출
  const keywords = [];
  for (const line of lines) {
    if (/세그먼트|타겟|포지셔닝|segment|target|position/i.test(line) && line.trim().length > 5) {
      keywords.push(line.trim().slice(0, 80));
    }
  }
  if (keywords.length > 0) {
    keywords.slice(0, 8).forEach(k => console.log(`  ${k}`));
  } else {
    console.log('  STP 키워드 미발견 — 문서 내용을 확인하세요');
  }
} else {
  console.log('  STP.md 미작성');
}

// 2. GTM 전략 요약
console.log('\n--- 2. GTM (시장 진출 전략) ---');
const gtmFile = join(docsDir, 'GTM.md');
if (existsSync(gtmFile)) {
  const content = readFileSync(gtmFile, 'utf8');
  const sections = content.match(/^#{1,3}\s+.+/gm) || [];
  console.log(`  섹션 ${sections.length}개:`);
  sections.slice(0, 8).forEach(s => console.log(`    ${s}`));
} else {
  console.log('  GTM.md 미작성 (선택 문서)');
}

// 3. 최근 개발 방향 (git log 기반)
console.log('\n--- 3. 최근 개발 방향 (커밋 분석) ---');
try {
  const logs = execSync('git log --oneline -20', { encoding: 'utf8' }).trim().split('\n');

  // 커밋 타입별 분류
  const types = {};
  const COMMIT_TYPES = ['feat', 'fix', 'docs', 'refactor', 'chore', 'test', 'style', 'perf', 'ci'];
  for (const line of logs) {
    for (const type of COMMIT_TYPES) {
      if (line.match(new RegExp(`^[a-f0-9]+\\s+${type}[:(]`))) {
        types[type] = (types[type] || 0) + 1;
        break;
      }
    }
  }

  console.log('  커밋 타입 분포 (최근 20개):');
  const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sorted) {
    const bar = '█'.repeat(count);
    console.log(`    ${type.padEnd(10)} ${bar} ${count}`);
  }

  // feat 커밋 제목으로 개발 방향 파악
  const feats = logs.filter(l => /feat[:(]/.test(l));
  if (feats.length > 0) {
    console.log('\n  최근 기능 추가:');
    feats.slice(0, 5).forEach(f => console.log(`    ${f}`));
  }
} catch {
  console.log('  (git log 실패)');
}

// 4. SRS/PRD 목표 vs 현재 구현 갭
console.log('\n--- 4. 목표 vs 현재 ---');
const specFile = existsSync(join(docsDir, 'SRS.md')) ? join(docsDir, 'SRS.md')
  : existsSync(join(docsDir, 'PRD.md')) ? join(docsDir, 'PRD.md') : null;

if (specFile) {
  const content = readFileSync(specFile, 'utf8');
  // 기능 요구사항 또는 유저 스토리 추출
  const requirements = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/FR-|US-|REQ-|\[필수\]|\[선택\]/i.test(line)) {
      requirements.push({ line: i + 1, text: line.trim().slice(0, 80) });
    }
  }
  if (requirements.length > 0) {
    console.log(`  ${specFile.split('/').pop()}에서 요구사항 ${requirements.length}건 발견:`);
    requirements.slice(0, 10).forEach(r => console.log(`    [L${r.line}] ${r.text}`));
    if (requirements.length > 10) console.log(`    ... 외 ${requirements.length - 10}건`);
  } else {
    console.log(`  ${specFile.split('/').pop()} 요구사항 패턴(FR-/US-/REQ-) 미발견`);
  }
} else {
  console.log('  SRS/PRD 미작성 — 목표 비교 불가');
}

// 5. 요약
console.log('\n=== 방향성 검토 완료 ===');
console.log('이 리포트는 구조적 신호만 제공합니다. 전략 이탈 판단은 에이전트가 STP/GTM을 읽고 판단하세요.');
