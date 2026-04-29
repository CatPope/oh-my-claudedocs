import fs from "node:fs";

const diffPath = process.argv[2];

if (!diffPath || !fs.existsSync(diffPath)) {
  console.log("- PR diff 파일이 없어 fallback 리뷰를 생략했습니다.");
  process.exit(0);
}

const rawDiff = fs.readFileSync(diffPath, "utf8");
if (!rawDiff.trim()) {
  console.log("- 변경된 코드가 없어 fallback 리뷰를 생략했습니다.");
  process.exit(0);
}

const lines = rawDiff.split("\n");
const files = new Set();
let additions = 0;
let deletions = 0;
const findings = [];

// omcd 전용: 민감 경로 추적
const docsDevFiles = [];
const templateFiles = [];
const rulesFiles = [];

for (const line of lines) {
  if (line.startsWith("+++ b/")) {
    const filePath = line.replace("+++ b/", "").trim();
    files.add(filePath);

    if (filePath.startsWith("docs/dev/")) {
      docsDevFiles.push(filePath);
    }
    if (filePath.startsWith("skills/dev-init/templates/docs/dev/")) {
      templateFiles.push(filePath);
    }
    if (filePath.startsWith("rules/")) {
      rulesFiles.push(filePath);
    }
    continue;
  }

  if (line.startsWith("+") && !line.startsWith("+++")) {
    additions += 1;
    const code = line.slice(1);

    if (/sk-proj-|AIza|api[_-]?key|secret/i.test(code)) {
      findings.push("민감정보(키/시크릿) 노출 패턴이 변경분에 포함될 수 있습니다.");
    }
    if (/innerHTML\s*=|eval\(/.test(code)) {
      findings.push("XSS/코드 실행 위험 패턴(`innerHTML`, `eval`)이 보입니다.");
    }
    if (/TODO|FIXME/i.test(code)) {
      findings.push("미완료 표시(`TODO`/`FIXME`)가 남아 있습니다.");
    }

    // omcd 전용: 문서 목차 L값 누락 감지
    if (
      /^##\s+목차/.test(code) &&
      !code.includes("L")
    ) {
      findings.push("문서 목차에 L값(줄 번호) 표기가 누락되었을 수 있습니다. `omcd.md` 규칙 10을 확인하세요.");
    }

    // omcd 전용: 필수 입력 플레이스홀더 감지
    if (/\[필수 입력\]/.test(code)) {
      findings.push("문서에 `[필수 입력]` 플레이스홀더가 남아 있습니다.");
    }
  } else if (line.startsWith("-") && !line.startsWith("---")) {
    deletions += 1;
  }
}

const uniqueFindings = [...new Set(findings)];
const fileList = [...files];

console.log("- ✅ 잘한 점");
console.log(
  `  - 변경 파일 ${fileList.length}개, 추가 ${additions}줄/삭제 ${deletions}줄로 PR 규모가 명확합니다.`
);
if (fileList.length > 0) {
  console.log(`  - 변경 파일: ${fileList.slice(0, 6).join(", ")}`);
}

// omcd 전용: 민감 경로 변경 요약
if (docsDevFiles.length > 0) {
  console.log(`  - docs/dev 문서 변경(${docsDevFiles.length}개): ${docsDevFiles.slice(0, 4).join(", ")}`);
}
if (templateFiles.length > 0) {
  console.log(`  - 문서 템플릿 변경(${templateFiles.length}개): ${templateFiles.slice(0, 4).join(", ")}`);
}
if (rulesFiles.length > 0) {
  console.log(`  - rules 변경(${rulesFiles.length}개): ${rulesFiles.slice(0, 4).join(", ")}`);
}

console.log("- ⚠️ 우선 확인할 이슈");
if (uniqueFindings.length === 0) {
  console.log("  - 자동 규칙 검사에서 즉시 위험 신호는 발견되지 않았습니다.");
} else {
  for (const finding of uniqueFindings.slice(0, 4)) {
    console.log(`  - ${finding}`);
  }
}

// omcd 전용: 연쇄 갱신 알림
const cascadeWarnings = [];
if (docsDevFiles.some((f) => f.includes("SRS") || f.includes("PRD"))) {
  cascadeWarnings.push("SRS/PRD 변경 감지 → Architecture, DetailedSpec, test-plan 갱신 필요 여부를 확인하세요.");
}
if (docsDevFiles.some((f) => f.includes("Architecture"))) {
  cascadeWarnings.push("Architecture 변경 감지 → DetailedSpec, test-plan 갱신 필요 여부를 확인하세요.");
}
if (rulesFiles.length > 0) {
  cascadeWarnings.push("rules 변경 감지 → CLAUDE.md 영향 여부를 확인하세요 (300줄 제한).");
}

if (cascadeWarnings.length > 0) {
  console.log("- 🔗 연쇄 갱신 체크 (omcd 규칙 8)");
  for (const warning of cascadeWarnings) {
    console.log(`  - ${warning}`);
  }
}

console.log("- 🔧 구조개선 제안");
console.log("  - 핵심 로직 변경 PR에는 테스트(또는 스모크 체크)를 함께 추가하세요.");
console.log("  - 사람 리뷰를 병행해 비즈니스 로직 누락 여부를 확인하세요.");
