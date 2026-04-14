#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const repository = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

if (!repository) {
  console.error("GITHUB_REPOSITORY is required.");
  process.exit(1);
}

if (!prNumber) {
  console.error("PR_NUMBER is required.");
  process.exit(1);
}

if (!token) {
  console.error("GH_TOKEN or GITHUB_TOKEN is required.");
  process.exit(1);
}

function runGh(args) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    env: {
      ...process.env,
      GH_TOKEN: token
    }
  });
}

function hasHeading(body, heading) {
  const target = `## ${heading}`;
  return body.split("\n").some((line) => line.trim().startsWith(target));
}

function extractSection(body, heading) {
  const lines = body.split("\n");
  const target = `## ${heading}`;

  let startIndex = -1;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim().startsWith(target)) {
      startIndex = index + 1;
      break;
    }
  }

  if (startIndex === -1) {
    return "";
  }

  const sectionLines = [];
  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^##\s+/.test(line.trim())) {
      break;
    }
    sectionLines.push(line);
  }

  return sectionLines.join("\n").trim();
}

const prRaw = runGh(["api", `repos/${repository}/pulls/${prNumber}`]);
const pr = JSON.parse(prRaw);
const body = String(pr.body || "").trim();

if (!body) {
  console.error("AI PR 본문 정책 위반:");
  console.error("1. PR 본문이 비어 있습니다. PR 템플릿을 작성해 주세요.");
  process.exit(1);
}

const requiredHeadings = [
  "변경 유형",
  "변경 요약",
  "영향 범위",
  "테스트",
  "체크리스트"
];

const foundHeadings = requiredHeadings.filter((h) => hasHeading(body, h));

// 템플릿이 아예 사용되지 않은 경우 (CLI/Claude Code 등) → 템플릿 작성 요구
if (foundHeadings.length === 0) {
  console.error("AI PR 본문 정책 위반:");
  console.error("1. PR 템플릿이 감지되지 않았습니다. GitHub에서 PR 본문을 편집하여 템플릿을 작성해 주세요.");
  console.error("   필수 섹션: ## 변경 유형, ## 변경 요약, ## 영향 범위, ## 테스트, ## 체크리스트");
  process.exit(1);
}

// 템플릿이 부분적으로 사용된 경우 → 누락 섹션 검증
const errors = [];

for (const heading of requiredHeadings) {
  if (!hasHeading(body, heading)) {
    errors.push(`필수 섹션 누락: \`## ${heading}\``);
  }
}

const requiredCheckedItems = [
  "CLAUDE.md 300줄 이하 유지",
  "Conventional Commits 형식 준수"
];

for (const item of requiredCheckedItems) {
  const checked = body.includes(`- [x] ${item}`) || body.includes(`- [X] ${item}`);
  if (!checked) {
    errors.push(`체크리스트 미완료: \`${item}\``);
  }
}

if (/\[필수 입력\]/.test(body)) {
  errors.push("`[필수 입력]` 플레이스홀더가 남아 있습니다.");
}

const summarySection = extractSection(body, "변경 요약");
if (!summarySection || summarySection.length < 10) {
  errors.push("`## 변경 요약` 섹션에 내용이 필요합니다.");
}

if (errors.length > 0) {
  console.error("AI PR 본문 정책 위반:");
  for (const [index, message] of errors.entries()) {
    console.error(`${index + 1}. ${message}`);
  }
  process.exit(1);
}

console.log(`AI PR 본문 정책 통과: PR #${prNumber}`);
