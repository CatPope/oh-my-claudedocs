// post-compact.mjs — PostCompact 훅
// compact 후 문서 현황 파악 → 진행 단계에 맞춰 .claudeignore 복원 지시

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseHookInput, info } from './_parse-input.mjs';

await parseHookInput();

const projectRoot = process.cwd();
const claudeignoreBackupPath = join(projectRoot, '.claudeignore.backup');

// 백업 내용을 읽어 systemMessage에 포함 (에이전트가 판단 후 복원)
let backupContent = '';
if (existsSync(claudeignoreBackupPath)) {
  backupContent = readFileSync(claudeignoreBackupPath, 'utf8');
}

const prompt = `[Docs OMC] compact 완료. 다음을 수행하라:

1. docs/dev/ 디렉토리를 확인하여 현재 개발 단계를 파악하라
2. 현재 진행 상황에 맞춰 .claudeignore를 갱신하라:
   - 기획 완료 → docs/dev/STP.md, docs/dev/GTM.md 추가
   - 설계 완료 → docs/dev/SRS.md 또는 PRD.md, docs/dev/Architecture.md, docs/dev/DetailedSpec.md 추가
   - 테스트 완료 → docs/dev/test-plan.md, docs/dev/test-results/, docs/dev/performance/, docs/dev/security-checklist/ 추가
   - prd.md, UML* 는 항상 포함
3. .claudeignore.backup 파일을 삭제하라
4. 중단된 작업을 자연스럽게 이어가라

compact 이전 .claudeignore 내용:
\`\`\`
${backupContent || '(비어있음)'}
\`\`\``;

info(prompt);
