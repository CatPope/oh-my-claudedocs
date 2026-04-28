// conventional-commit.mjs — PreToolUse/Bash 훅
// git commit 메시지가 Conventional Commits 형식인지 검증

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

// git commit 감지 (git log 등 오탐 방지)
const isGitCommit = /\bgit\s+commit\b/.test(command) && !/\bgit\s+log\b/.test(command);
if (!isGitCommit) {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

// --amend, --allow-empty 등 메시지 없는 커밋은 통과
if (/--amend/.test(command) && !/-m\s/.test(command)) {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

// 커밋 메시지 추출
let message = '';

// 패턴 1: -m "message" 또는 -m 'message'
const dashMQuoted = command.match(/-m\s+["']([^"']+)["']/);
if (dashMQuoted) {
  message = dashMQuoted[1];
}

// 패턴 2: heredoc $(cat <<'EOF' ... EOF)
if (!message) {
  const heredoc = command.match(/\$\(cat\s+<<['"]?EOF['"]?\s*\n([\s\S]*?)\nEOF/m);
  if (heredoc) {
    // heredoc의 첫 번째 줄이 subject
    message = heredoc[1].split('\n')[0].trim();
  }
}

// 패턴 3: -m message (따옴표 없는 경우)
if (!message) {
  const dashMBare = command.match(/-m\s+(\S+)/);
  if (dashMBare) {
    message = dashMBare[1];
  }
}

// 메시지를 추출 못했으면 통과 (에디터로 작성할 수 있으므로)
if (!message) {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

// Co-Authored-By 줄은 제거하고 첫 줄만 검증
const subject = message.split('\n')[0].trim();

// Conventional Commits 정규식
// type(scope): subject — scope은 선택, 한글/영문 허용
const TYPES = ['feat', 'fix', 'docs', 'refactor', 'chore', 'test', 'style', 'perf', 'ci', 'build', 'revert'];
const pattern = new RegExp(
  `^(${TYPES.join('|')})(\\([a-z][a-z0-9-]*\\))?(!)?:\\s+.{1,49}[^.]$`
);

if (!pattern.test(subject)) {
  const examples = [
    'feat(hooks): 하네스 훅 추가',
    'fix: 로그인 버그 수정',
    'docs(rules): 규칙 문서 갱신'
  ];
  console.log(JSON.stringify({
    continue: false,
    stopReason: `[oh-my-claudedocs] Conventional Commits 형식 위반\n\n현재: "${subject}"\n\n올바른 형식: <type>(<scope>): <subject>\n- type: ${TYPES.join(', ')}\n- scope: 선택 (소문자, 하이픈)\n- subject: 50자 이내, 마침표 없음\n\n예시:\n${examples.map(e => `  ${e}`).join('\n')}`
  }));
} else {
  console.log(JSON.stringify({ continue: true }));
}
