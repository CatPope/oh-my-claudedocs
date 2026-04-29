// docs-header-check.mjs — PostToolUse/Write|Edit 훅
// docs/**/*.md 파일의 15줄 헤더 구조와 L값 목차 정합성 검증

import { readFileSync } from 'fs';

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

let input;
try {
  input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
} catch {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

const toolInput = input.tool_input || {};
const filePath = (toolInput.file_path || '').replace(/\\/g, '/');

// docs/ 하위 .md 파일만 대상 (루트 상대 경로 docs/ 포함)
if (!/(?:^|\/|\\)docs\//.test(filePath) || !filePath.endsWith('.md')) {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

// 템플릿 파일은 제외 (.template.md)
if (filePath.endsWith('.template.md')) {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

let content;
try {
  content = readFileSync(toolInput.file_path, 'utf8');
} catch {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

const lines = content.split('\n');
const warnings = [];

// 검사 1: 15번째 줄이 --- 인지 확인
if (lines.length >= 15) {
  const line15 = lines[14].trim();
  if (line15 !== '---') {
    warnings.push(`15번째 줄이 '---'가 아닙니다 (현재: '${line15}'). 헤더 구조를 확인하세요.`);
  }
} else if (lines.length > 5) {
  // 5줄 이하는 빈 문서이므로 무시, 6~14줄은 경고
  warnings.push(`문서가 ${lines.length}줄로 15줄 헤더 구조에 부족합니다.`);
}

// 검사 2: 목차의 L값과 실제 섹션 위치 정합성
const tocPattern = /\.{2,}\s*L(\d+)\s*$/;
const tocEntries = [];
for (let i = 0; i < Math.min(15, lines.length); i++) {
  const match = lines[i].match(tocPattern);
  if (match) {
    tocEntries.push({ line: i + 1, label: lines[i].trim(), target: parseInt(match[1], 10) });
  }
}

if (tocEntries.length > 0) {
  const mismatches = [];
  for (const entry of tocEntries) {
    const targetIdx = entry.target - 1;
    if (targetIdx >= lines.length) {
      mismatches.push(`L${entry.target}: 문서 길이(${lines.length}줄) 초과`);
      continue;
    }
    // 타겟 줄이 ## 또는 ### 섹션 헤딩인지 확인
    const targetLine = lines[targetIdx].trim();
    if (!targetLine.startsWith('#')) {
      mismatches.push(`L${entry.target}: 섹션 헤딩이 아닙니다 ('${targetLine.slice(0, 40)}')`);
    }
  }
  if (mismatches.length > 0) {
    warnings.push(`목차 L값 불일치:\n${mismatches.map(m => `  - ${m}`).join('\n')}`);
  }
}

if (warnings.length > 0) {
  console.log(JSON.stringify({
    continue: true,
    systemMessage: `[oh-my-claudedocs] docs 헤더 검증 경고 (${filePath}):\n${warnings.map(w => `- ${w}`).join('\n')}\n\n목차의 L값을 실제 줄 번호에 맞게 갱신하세요.`
  }));
} else {
  console.log(JSON.stringify({ continue: true }));
}
