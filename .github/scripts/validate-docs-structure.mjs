#!/usr/bin/env node
/**
 * validate-docs-structure.mjs
 * Validates all document templates in skills/dev-init/templates/docs/dev/
 *
 * Rules:
 *   1. Line 15 must be exactly "---"
 *   2. Lines 1-14 must contain TOC with L-value entries (pattern: ".. L\d+")
 *   3. Each L-value must match the actual line number of that section heading
 *
 * Exit code 0 = pass, 1 = fail with details
 */

import fs from "node:fs";
import path from "node:path";

const TEMPLATES_DIR = "skills/dev-init/templates/docs/dev";

function findTemplateFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...findTemplateFiles(full));
    } else if (entry.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

function validateFile(filePath) {
  const errors = [];
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n").map((l) => l.replace(/\r$/, ""));

  // Rule 1: Line 15 (index 14) must be exactly "---"
  const line15 = lines[14];
  if (line15 === undefined) {
    errors.push(`Line 15 does not exist (file has only ${lines.length} lines)`);
    return errors;
  }
  if (line15 !== "---") {
    errors.push(`Line 15 must be exactly "---", got: ${JSON.stringify(line15)}`);
  }

  // Rule 2: Lines 1-14 must contain at least one TOC entry with L-value
  const header = lines.slice(0, 14).join("\n");
  const lValuePattern = /\.\. L(\d+)/g;
  const tocEntries = [];
  let match;
  while ((match = lValuePattern.exec(header)) !== null) {
    const lValue = Number.parseInt(match[1], 10);
    tocEntries.push(lValue);
  }

  if (tocEntries.length === 0) {
    errors.push(
      "Lines 1-14 must contain at least one TOC entry with L-value (pattern: .. L<number>)"
    );
    return errors;
  }

  // Rule 3: Each L-value must match the actual line number of a section heading
  const headingLineNumbers = new Map();
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i])) {
      headingLineNumbers.set(i + 1, lines[i]); // 1-based
    }
  }

  for (const lValue of tocEntries) {
    if (!headingLineNumbers.has(lValue)) {
      errors.push(
        `TOC references L${lValue} but no section heading found at line ${lValue}` +
          ` (headings at: ${[...headingLineNumbers.keys()].join(", ")})`
      );
    }
  }

  return errors;
}

const files = findTemplateFiles(TEMPLATES_DIR);

if (files.length === 0) {
  console.error(`No template files found in ${TEMPLATES_DIR}`);
  process.exit(1);
}

let failed = 0;

for (const file of files.sort()) {
  const errors = validateFile(file);
  if (errors.length > 0) {
    console.error(`FAIL ${file}`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    failed += 1;
  } else {
    console.log(`PASS ${file}`);
  }
}

console.log(`\nvalidate-docs-structure: ${files.length - failed}/${files.length} passed`);

if (failed > 0) {
  process.exit(1);
}
