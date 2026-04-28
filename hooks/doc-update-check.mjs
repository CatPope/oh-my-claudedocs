// doc-update-check.mjs — PreToolUse/Bash 훅
// git commit 감지 시 스테이지된 파일을 분석하여 갱신 필요한 문서를 알림.

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { parseHookInput, pass, info } from './_parse-input.mjs';

const input = await parseHookInput();
if (!input) pass();

const command = input.toolInput?.command || '';

// git commit 패턴 감지 (git commit, git commit -m 등)
// git commit-graph 등 하위 명령어 제외
const isGitCommit = /\bgit\s+commit(?:\s+|$)/.test(command);

if (!isGitCommit) pass();

const cwd = process.cwd();
const docsDir = join(cwd, 'docs', 'dev');

// 스테이지된 파일 목록 가져오기
let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only', {
    cwd,
    encoding: 'utf8',
    timeout: 8000,
    stdio: 'pipe'
  });
  stagedFiles = output.trim().split('\n').filter(Boolean);
} catch {
  // git 명령 실패 시 무시하고 커밋 허용
  pass();
}

if (stagedFiles.length === 0) pass();

// 문서 갱신 감지 결과 수집
// { docName: [reason, ...] }
const docAlerts = {};
const cascadeAlerts = [];

function addAlert(docName, reason) {
  if (!docAlerts[docName]) docAlerts[docName] = [];
  docAlerts[docName].push(reason);
}

for (const file of stagedFiles) {
  const lower = file.toLowerCase();
  const basename = file.split('/').pop().toLowerCase();

  // db-schema: SQL, migration, schema 파일
  if (
    lower.endsWith('.sql') ||
    lower.includes('migration') ||
    lower.includes('schema')
  ) {
    addAlert('db-schema.md', `스키마 관련 파일 변경 감지 (${file})`);
  }

  // api-spec: API 라우트/컨트롤러 관련 파일
  if (
    lower.includes('/api/') ||
    lower.includes('/routes/') ||
    lower.includes('/controllers/') ||
    lower.includes('/router/')
  ) {
    addAlert('api-spec.md', `API 라우트 변경 감지 (${file})`);
  }

  // env-guide: 환경 변수, 설정 파일
  if (
    basename.startsWith('.env') ||
    basename === 'config.js' ||
    basename === 'config.ts' ||
    basename === 'config.json' ||
    lower.includes('/config/')
  ) {
    addAlert('env-guide.md', `환경/설정 파일 변경 감지 (${file})`);
  }

  // CLAUDE.md: package.json 의존성 변경
  if (basename === 'package.json') {
    addAlert('CLAUDE.md', `package.json 변경 감지 — 기술 스택 항목 확인 필요 (${file})`);
  }

  // 연쇄 갱신: SRS/PRD 변경 → Architecture, DetailedSpec, test-plan
  if (lower.endsWith('srs.md') || lower.endsWith('prd.md')) {
    const srcDoc = file.split('/').pop();
    cascadeAlerts.push(
      `${srcDoc} 변경 → Architecture.md, DetailedSpec.md, test-plan.md 확인 필요`
    );
  }

  // 연쇄 갱신: Architecture 변경 → DetailedSpec, test-plan
  if (lower.endsWith('architecture.md')) {
    cascadeAlerts.push(
      `Architecture.md 변경 → DetailedSpec.md, test-plan.md 확인 필요`
    );
  }
}

// docs/dev/ 디렉토리가 없으면 직접 문서 존재 여부 체크 생략
const docsExists = existsSync(docsDir);

// 존재하는 문서만 필터링 (docs/dev/가 없으면 전체 알림)
const filteredAlerts = {};
for (const [docName, reasons] of Object.entries(docAlerts)) {
  if (!docsExists || existsSync(join(docsDir, docName))) {
    filteredAlerts[docName] = reasons;
  }
}

// docs/dev/*.md 파일 스테이지 여부 확인 (작성+검토 세트 원칙)
const stagedDocs = stagedFiles.filter(f =>
  f.replace(/\\/g, '/').match(/^docs\/dev\/[^/]+\.md$/)
);

const hasAlerts = Object.keys(filteredAlerts).length > 0 || cascadeAlerts.length > 0;
const hasDocWrites = stagedDocs.length > 0;

if (!hasAlerts && !hasDocWrites) pass();

// 메시지 조합
const lines = ['[Docs OMC] 문서 갱신 알림:'];

for (const [docName, reasons] of Object.entries(filteredAlerts)) {
  for (const reason of reasons) {
    lines.push(`- ${docName}: ${reason}`);
  }
}

if (cascadeAlerts.length > 0) {
  lines.push('연쇄 갱신:');
  for (const alert of cascadeAlerts) {
    lines.push(`- ${alert}`);
  }
}

if (hasDocWrites) {
  lines.push('');
  lines.push(`문서 작성+검토 세트: ${stagedDocs.map(f => f.split('/').pop()).join(', ')} 수정됨.`);
  lines.push('커밋 후 `/doc-review` 실행을 권장한다. (문서 작성과 검토는 항상 세트로 진행)');
}

lines.push('');
lines.push('자동 갱신하지 않고 사용자에게 확인 후 진행하라.');

info(lines.join('\n'));
