#!/usr/bin/env node
/**
 * validate-install.mjs
 * Validates install.mjs for correctness.
 *
 * Checks:
 *   1. Syntax check via "node -c install.mjs"
 *   2. All referenced source files exist (rules/*.md, hooks/*.mjs, skills/*\/SKILL.md)
 *   3. Template files referenced in dev-init exist
 *
 * Exit code 0 = pass, 1 = fail with details
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

let failed = false;

function fail(msg) {
  console.error(`FAIL ${msg}`);
  failed = true;
}

function pass(msg) {
  console.log(`PASS ${msg}`);
}

function checkExists(filePath, label) {
  if (fs.existsSync(filePath)) {
    pass(label || filePath);
  } else {
    fail(`${label || filePath} — file not found: ${filePath}`);
  }
}

// ─── Check 1: Syntax ───
process.stdout.write("Checking syntax: node -c install.mjs ... ");
try {
  execFileSync("node", ["-c", "install.mjs"], { encoding: "utf8" });
  console.log("OK");
  pass("syntax check");
} catch (err) {
  console.log("");
  fail(`syntax check — ${err.message.trim()}`);
}

// ─── Check 2: Referenced source files ───

// rules/*.md referenced in install.mjs
const rulesFiles = [
  "rules/docs-omc.md",
  "rules/docs-omc-ref.md"
];
for (const f of rulesFiles) {
  checkExists(f, `rules file: ${f}`);
}

// hooks/*.mjs referenced in install.mjs
const hooksFiles = [
  "hooks/session-start.mjs",
  "hooks/pre-commit-check.mjs",
  "hooks/post-save-mmd.mjs",
  "hooks/pre-compact.mjs",
  "hooks/post-compact.mjs"
];
for (const f of hooksFiles) {
  checkExists(f, `hook file: ${f}`);
}

// skills/*/SKILL.md referenced in install.mjs
const skills = [
  "dev-init",
  "dev-team",
  "security-report",
  "test-report",
  "performance-report",
  "architecture-doc"
];
for (const skill of skills) {
  const skillMd = path.join("skills", skill, "SKILL.md");
  checkExists(skillMd, `skill SKILL.md: ${skillMd}`);
}

// ─── Check 3: Template files in dev-init ───
const templatesDir = "skills/dev-init/templates/docs/dev";

if (!fs.existsSync(templatesDir)) {
  fail(`templates directory not found: ${templatesDir}`);
} else {
  pass(`templates directory exists: ${templatesDir}`);

  // Collect all template files recursively
  function collectFiles(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        results.push(...collectFiles(full));
      } else {
        results.push(full);
      }
    }
    return results;
  }

  const templateFiles = collectFiles(templatesDir);
  if (templateFiles.length === 0) {
    fail(`no template files found in ${templatesDir}`);
  } else {
    pass(`found ${templateFiles.length} template file(s) in ${templatesDir}`);
    for (const f of templateFiles) {
      checkExists(f, `template: ${f}`);
    }
  }
}

// ─── Result ───
if (failed) {
  console.error("\nvalidate-install: FAILED");
  process.exit(1);
}

console.log("\nvalidate-install: all checks passed");
