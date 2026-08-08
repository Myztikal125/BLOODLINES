import fs from "fs";
import path from "path";
import { askAI } from "./aiClient";
import { IMPLEMENTATION_GOVERNANCE } from "./implementationGovernance";

const RULES_BIBLE_PATH = "docs/RULES_BIBLE.md";
const MAX_REPOSITORY_EVIDENCE_CHARS = 14000;
const MAX_FILE_CHARS = 3500;
const MAX_FILES = 8;

export interface ImplementationRequest {
  system: string;
  context?: string;
}

export function readRulesBible(): string {
  if (!fs.existsSync(RULES_BIBLE_PATH)) {
    throw new Error(`Rules Bible not found: ${RULES_BIBLE_PATH}`);
  }

  return fs.readFileSync(RULES_BIBLE_PATH, "utf8");
}

function readRepositoryEvidence(inputPath: string, system: string): string {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Repository evidence path not found: ${inputPath}`);
  }

  const stat = fs.statSync(inputPath);

  if (stat.isFile()) {
    return fs.readFileSync(inputPath, "utf8").slice(0, MAX_FILE_CHARS);
  }

  const files: string[] = [];
  const keywords = system
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(word => word.length >= 4);

  function walk(directory: string) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;

      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(ts|tsx|js|json|md)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(inputPath);

  const ranked = files
    .map(file => {
      const normalized = file.toLowerCase();
      const score = keywords.reduce(
        (total, keyword) => total + (normalized.includes(keyword) ? 1 : 0),
        0
      );
      return { file, score };
    })
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))
    .slice(0, MAX_FILES);

  let output = "";

  for (const { file, score } of ranked) {
    if (output.length >= MAX_REPOSITORY_EVIDENCE_CHARS) break;

    try {
      const content = fs.readFileSync(file, "utf8").slice(0, MAX_FILE_CHARS);
      const section = `\n===== ${file} (relevance ${score}) =====\n${content}\n`;

      if (output.length + section.length <= MAX_REPOSITORY_EVIDENCE_CHARS) {
        output += section;
      }
    } catch {
      // Ignore unreadable files; repository inspection should continue.
    }
  }

  return output || "[No readable repository evidence matched the requested system.]";
}

export async function implementDesign(
  dataFile: string,
  enginePath: string,
  request?: ImplementationRequest
) {
  const requestedSystem =
    request?.system ?? "Review the supplied implementation against the Rules Bible.";

  const data = readRepositoryEvidence(dataFile, requestedSystem);
  const engine = readRepositoryEvidence(enginePath, requestedSystem);
  const rulesBible = readRulesBible();

  const context =
    request?.context ??
    "Determine whether the requested approved system is already implemented or what authorized integration work remains.";

  const result = await askAI(
`You are the BLOODLINES Implementation Assistant.

Determine whether ONE REQUESTED BLOODLINES SYSTEM can be implemented from the current Rules Bible and repository evidence. You are an implementation analyst, NOT a game designer.

AUTHORITATIVE SOURCE ORDER:
1. Rules Bible
2. Explicit human-approved decisions recorded in the Rules Bible
3. Existing approved game data
4. Existing engine behavior as evidence of implementation state only

SYSTEM REQUESTED:
${requestedSystem}

CONTEXT:
${context}

RULES BIBLE:
${rulesBible}

REPOSITORY EVIDENCE:
${data}

ADDITIONAL ENGINE EVIDENCE:
${engine}

GOVERNANCE:
- Analyze ONLY the requested system.
- APPROVED authorizes a system; it does not define unspecified mechanics.
- READY requires every implementation-critical mechanic to be explicitly authorized.
- ALREADY_IMPLEMENTED requires repository evidence proving the behavior exists and is integrated.
- If an implementation-critical mechanic is missing, use BLOCKED_BY_HUMAN_DECISION.
- Never invent numbers, costs, durations, triggers, formulas, stacking rules, resource rules, or other mechanics.
- Never silently import D&D rules.
- Never invent file paths. Every affected file must be supported by repository evidence.
- Never claim code was changed. This assistant produces an assessment/plan only.

If BLOCKED_BY_HUMAN_DECISION:
- Human Decisions Required must contain concrete QUESTIONS only.
- Do not answer those questions or propose mechanics.
- Do not place blocked behavior under Required Changes.

If READY:
- Human Decisions Required must be None.
- Required Changes must contain concrete authorized changes tied to repository findings.
- Tests must verify approved behavior only.

OUTPUT EXACTLY:

# Implementation Status

# Approved Requirements

# Repository Findings

# Human Decisions Required

# Files Affected

# Required Changes

# Tests

# Risks

# Verification

${IMPLEMENTATION_GOVERNANCE}`
  );

  return result;
}
