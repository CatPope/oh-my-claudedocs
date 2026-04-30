#!/usr/bin/env node
/**
 * scan-secrets.mjs
 * Scans working tree and git history for leaked secrets.
 *
 * Usage: node scan-secrets.mjs [--history <depth>]
 *
 * Exit code 0 = clean, 1 = potential secrets found
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";

const args = process.argv.slice(2);
const historyFlagIndex = args.findIndex((arg) => arg === "--history");
const historyDepth =
  historyFlagIndex >= 0 && args[historyFlagIndex + 1]
    ? Number.parseInt(args[historyFlagIndex + 1], 10)
    : 0;

const patterns = [
  { name: "OpenAI API key", regex: /sk-[A-Za-z0-9_-]{20,}/g },
  { name: "Anthropic API key", regex: /sk-ant-[A-Za-z0-9_-]{20,}/g },
  { name: "Google API key", regex: /AIza[0-9A-Za-z_-]{20,}/g },
  { name: "AWS Access Key ID", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "GitHub Personal Access Token (classic)", regex: /ghp_[0-9A-Za-z]{20,}/g },
  { name: "GitHub OAuth token", regex: /gho_[0-9A-Za-z]{20,}/g },
  { name: "GitHub fine-grained token", regex: /github_pat_[0-9A-Za-z_]{20,}/g },
  { name: "Slack token", regex: /xox[bpras]-[0-9A-Za-z-]{10,}/g },
  { name: "npm token", regex: /npm_[A-Za-z0-9]{36}/g },
  { name: "Private key", regex: /-----BEGIN\s+(RSA|EC|DSA|OPENSSH)?\s*PRIVATE KEY-----/g },
];

function trackedFiles() {
  const output = execFileSync("git", ["ls-files"], { encoding: "utf8" }).trim();
  if (!output) return [];
  return output.split("\n");
}

function scanContent(content, source, findings) {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;
      if (pattern.regex.test(line)) {
        findings.push({
          source,
          line: i + 1,
          kind: pattern.name,
          sample: line.trim().slice(0, 120),
        });
      }
    }
  }
}

function scanWorkingTree() {
  const findings = [];
  for (const file of trackedFiles()) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    scanContent(text, file, findings);
  }
  return findings;
}

function scanHistory(depth) {
  if (!depth || Number.isNaN(depth) || depth <= 0) return [];
  const findings = [];
  const commitsOutput = execFileSync(
    "git",
    ["rev-list", `--max-count=${depth}`, "HEAD"],
    { encoding: "utf8" }
  ).trim();
  if (!commitsOutput) return findings;

  const commits = commitsOutput.split("\n");
  const regexSource = patterns.map((p) => p.regex.source).join("|");

  for (const commit of commits) {
    try {
      const result = execFileSync(
        "git",
        ["grep", "-nE", regexSource, commit, "--"],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
      ).trim();
      if (!result) continue;
      for (const line of result.split("\n").slice(0, 10)) {
        findings.push({
          source: `commit:${commit.slice(0, 12)}`,
          line: 0,
          kind: "History match",
          sample: line.slice(0, 140),
        });
      }
    } catch (error) {
      if (error.status !== 1) {
        console.warn(`Warning: git grep failed on ${commit.slice(0, 12)} (exit ${error.status})`);
      }
    }
  }
  return findings;
}

const findings = [...scanWorkingTree(), ...scanHistory(historyDepth)];

if (findings.length > 0) {
  console.error("Secret scan failed. Potential credentials detected:");
  for (const f of findings.slice(0, 20)) {
    const lineHint = f.line > 0 ? `:${f.line}` : "";
    console.error(`- [${f.kind}] ${f.source}${lineHint} -> ${f.sample}`);
  }
  process.exit(1);
}

console.log(
  `scan-secrets: no matches in working tree${historyDepth > 0 ? ` or last ${historyDepth} commits` : ""}`
);
