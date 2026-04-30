// post-doc-toc-sync.mjs — PostToolUse/Write,Edit 훅
// docs/dev/*.md 파일 생성/수정 시 15줄 헤더의 목차 L값을 자동 갱신

import { readFileSync, writeFileSync } from 'fs';
import { parseHookInput, pass, info } from './_parse-input.mjs';

const input = await parseHookInput();
if (!input) pass();

const filePath = input.toolInput?.file_path || '';

// docs/dev/ 하위 .md 파일만 대상
if (!filePath.replace(/\\/g, '/').includes('docs/dev/') || !filePath.endsWith('.md')) {
  pass();
}

try {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // 15줄 헤더 구조 확인 (15번째 줄이 --- 인지)
  if (lines.length < 15 || lines[14].trim() !== '---') pass();

  // 본문(16줄~)에서 ## 헤딩 위치 수집 (1-based)
  const headings = [];
  for (let i = 15; i < lines.length; i++) {
    const match = lines[i].match(/^##\s+(.+)/);
    if (match) {
      headings.push({ title: match[1].trim(), line: i + 1 });
    }
  }

  if (headings.length === 0) pass();

  // 헤더(1~14줄)에서 기존 목차 영역 찾기
  const tocStart = lines.findIndex((l, i) => i < 14 && /^##\s+목차/.test(l));
  if (tocStart === -1) pass();

  // 목차 항목 재생성 (헤딩의 번호 접두사 제거: "1. 개요" → "개요")
  const newTocLines = headings.map((h, idx) => {
    const title = h.title.replace(/^\d+\.\s*/, '');
    return `${idx + 1}. ${title} .. L${h.line}`;
  });

  // 기존 목차 항목 범위 파악 (tocStart 다음 줄부터 빈 줄 또는 14줄까지)
  let tocEnd = tocStart + 1;
  while (tocEnd < 14 && lines[tocEnd].trim() !== '') {
    tocEnd++;
  }

  // 헤더 14줄 유지를 위해 빈 줄 패딩 계산
  const oldTocItemCount = tocEnd - (tocStart + 1);
  const newTocItemCount = newTocLines.length;
  const paddingNeeded = 14 - (tocStart + 1) - newTocItemCount;

  // 새 헤더 조립
  const newHeader = [
    ...lines.slice(0, tocStart + 1),
    ...newTocLines,
    ...Array(Math.max(0, paddingNeeded)).fill(''),
  ];

  // 정확히 14줄로 맞추기
  while (newHeader.length < 14) newHeader.push('');
  if (newHeader.length > 14) newHeader.length = 14;

  // 전체 파일 재조립 (헤더 14줄 + --- + 본문)
  const newContent = [...newHeader, '---', ...lines.slice(15)].join('\n');

  if (newContent !== content) {
    writeFileSync(filePath, newContent, 'utf8');
    info(`[Docs OMC] 목차 L값 자동 갱신 완료: ${filePath.split(/[\\/]/).pop()}`);
  } else {
    pass();
  }
} catch {
  // 파일 읽기/쓰기 실패 시 차단하지 않고 통과
  pass();
}
