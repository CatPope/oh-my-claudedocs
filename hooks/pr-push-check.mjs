// pr-push-check.mjs — PreToolUse/Bash 훅
// git push 전 열린 PR 존재/타이틀 일치 확인 (CLAUDE.md push 전 4단계)

import { execSync } from 'child_process';

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

let input;
try {
  input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
} catch {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

const command = input.tool_input?.command || '';

// git push 감지
const isGitPush = /\bgit\s+push\b/.test(command);
if (!isGitPush) {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

// main/master로 force push 차단
if (/--force/.test(command) && /(main|master)\b/.test(command)) {
  console.log(JSON.stringify({
    continue: false,
    stopReason: '[oh-my-claudedocs] main/master로의 force push는 차단됩니다.'
  }));
  process.exit(0);
}

try {
  // 1. 현재 브랜치 확인
  const branch = execSync('git branch --show-current', { encoding: 'utf8', timeout: 3000 }).trim();
  if (!branch || branch === 'main' || branch === 'master') {
    // main/master 직접 push는 별도 정책 (여기선 통과)
    console.log(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  // 2. 열린 PR 확인
  let prData = [];
  try {
    const prJson = execSync(
      `gh pr list --state open --head "${branch}" --json number,title,state,url`,
      { encoding: 'utf8', timeout: 5000 }
    );
    prData = JSON.parse(prJson);
  } catch {
    // gh 미설치 또는 네트워크 실패 — 통과 (비차단)
    console.log(JSON.stringify({
      continue: true,
      systemMessage: '[oh-my-claudedocs] PR 확인 실패 (gh cli 또는 네트워크). push는 허용하되 PR 상태를 수동 확인하세요.'
    }));
    process.exit(0);
  }

  // 3. PR이 없으면 경고 (차단은 안 함, systemMessage로 안내)
  if (prData.length === 0) {
    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[oh-my-claudedocs] 브랜치 '${branch}'에 열린 PR이 없습니다. push 후 새 PR을 생성하거나, 기존 열린 PR의 브랜치를 확인하세요.`
    }));
    process.exit(0);
  }

  // 4. PR 존재 — 정보 전달
  const prInfo = prData.map(pr => `#${pr.number}: ${pr.title} (${pr.url})`).join('\n');
  console.log(JSON.stringify({
    continue: true,
    systemMessage: `[oh-my-claudedocs] push 대상 PR 확인:\n${prInfo}\n\nPR 제목과 현재 변경 사항이 일치하는지 확인하세요.`
  }));

} catch (e) {
  // 예외 — 통과 (push 차단하지 않음)
  console.log(JSON.stringify({
    continue: true,
    systemMessage: `[oh-my-claudedocs] PR 확인 중 오류: ${e.message}. push는 허용합니다.`
  }));
}
