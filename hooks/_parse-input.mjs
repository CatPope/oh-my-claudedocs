// _parse-input.mjs — 훅 공통 stdin 파싱 유틸리티

export async function parseHookInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function pass() {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

export function block(reason) {
  console.log(JSON.stringify({ continue: false, stopReason: reason }));
  process.exit(0);
}

export function info(systemMessage) {
  console.log(JSON.stringify({ continue: true, systemMessage }));
  process.exit(0);
}

// 공통 정규식: git commit 감지 (git commit-graph 등 하위 명령어 제외)
export const GIT_COMMIT_RE = /\bgit\s+commit(?:\s+|$)/;
