#!/usr/bin/env node

// check-all-doc-headers.mjs — 전체 docs/ 15줄 헤더 + L값 목차 배치 검증
// 사용법: node claude_temp/check-all-doc-headers.mjs

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const docsDir = 'docs/dev';

function collectMdFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectMdFiles(full));
    } else if (entry.endsWith('.md') && !entry.endsWith('.template.md')) {
      results.push(full);
    }
  }
  return results;
}

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  // 5줄 이하는 빈 문서
  if (lines.length <= 5) return null;

  // 15줄째 --- 확인
  if (lines.length >= 15) {
    if (lines[14].trim() !== '---') {
      issues.push(`15번째 줄이 '---'가 아님 (현재: '${lines[14].trim()}')`);
    }
  } else {
    issues.push(`${lines.length}줄 — 15줄 헤더 구조 부족`);
  }

  // L값 목차 검증
  const tocPattern = /\.{2,}\s*L(\d+)\s*$/;
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const match = lines[i].match(tocPattern);
    if (match) {
      const target = parseInt(match[1], 10);
      if (target > lines.length) {
        issues.push(`L${target}: 문서 길이(${lines.length}줄) 초과`);
      } else if (!lines[target - 1].trim().startsWith('#')) {
        issues.push(`L${target}: 섹션 헤딩이 아님 ('${lines[target - 1].trim().slice(0, 30)}')`);
      }
    }
  }

  return issues.length > 0 ? issues : null;
}

const files = collectMdFiles(docsDir);

if (files.length === 0) {
  console.log(`'${docsDir}' 에 검사 대상 .md 파일이 없습니다.`);
  process.exit(0);
}

let errorCount = 0;
for (const file of files) {
  const issues = checkFile(file);
  if (issues) {
    console.log(`\n✗ ${file}`);
    issues.forEach(i => console.log(`  - ${i}`));
    errorCount++;
  }
}

if (errorCount === 0) {
  console.log(`✓ ${files.length}개 파일 모두 헤더 구조 정상`);
} else {
  console.log(`\n--- ${files.length}개 중 ${errorCount}개 문제 발견 ---`);
}
