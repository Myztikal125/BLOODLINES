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
  if (!fs.existsSync(inputPath)) throw new Error(`Repository evidence path not found: ${inputPath}`);
  if (fs.statSync(inputPath).isFile()) return fs.readFileSync(inputPath, "utf8").slice(0, MAX_FILE_CHARS);

  const files: string[] = [];
  const keywords = system.toLowerCase().split(/[^a-z0-9]+/).filter(word => word.length >= 4);

  function walk(directory: string) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (/\.(ts|tsx|js|json|md)$/.test(entry.name)) files.push(fullPath);
    }
  }

  walk(inputPath);

  const ranked = files.map(file => {
    const normalized = file.toLowerCase();
    const score = keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? 1 : 0), 0);
    return { file, score };
  }).sort((a, b) => b.score - a.score || a.file.localeCompare(b.file)).slice(0, MAX_FILES);

  let output = "";
  for (const { file, score } of ranked) {
    if (output.length >= MAX_REPOSITORY_EVIDENCE_CHARS) break;
    try {
      const content = fs.readFileSync(file, "utf8").slice(0, MAX_FILE_CHARS);
      const section = `\n===== ${file} (relevance ${score}) =====\n${content}\n`;
      if (output.length + section.length <= MAX_REPOSITORY_EVIDENCE_CHARS) output += section;
    } catch {}
  }
  return output || "[No readable repository evidence matched the requested system.]";
}

function getRequiredEvidence(system: string): string {
  const normalized = system.toLowerCase();
  if (normalized.includes("action economy")) {
    return `ACTION ECONOMY COMPLETION GATE:
ALREADY_IMPLEMENTED is forbidden unless repository evidence proves ALL of these behavioral requirements:
1. A combat turn grants exactly one Action.
2. A combat turn grants exactly one Bonus Action.
3. A Reaction is available outside the combatant's own turn when an authorized trigger occurs.
4. Action use is tracked/consumed so a second Action cannot be taken in the same turn under the baseline rules.
5. Bonus Action use is tracked/consumed so a second Bonus Action cannot be taken in the same turn under the baseline rules.
6. Reaction availability/use is tracked and cannot be reused until the engine's authorized reset point.
7. Turn transition/reset logic restores the baseline Action, Bonus Action, and Reaction state as authorized.
8. The approved energy/stamina framework exists, while no stamina costs are assigned unless explicitly approved.
9. Stamina cannot be spent to purchase additional baseline Actions or Bonus Actions.

Action type declarations alone are NOT evidence of implementation. A file defining attack/spell/move actions does not prove Action Economy is implemented.
If any required behavior above is not directly evidenced in repository code, do NOT return ALREADY_IMPLEMENTED. Return READY only if the missing work is fully authorized by the Rules Bible; otherwise return BLOCKED_BY_HUMAN_DECISION.`;
  }
  return `COMPLETION GATE:
ALREADY_IMPLEMENTED requires direct repository evidence for every behavioral requirement explicitly approved for the requested system. Definitions, enums, type declarations, filenames, comments, or related functionality alone do not prove behavior is implemented and integrated.`;
}

export async function implementDesign(dataFile: string, enginePath: string, request?: ImplementationRequest) {
  const requestedSystem = request?.system ?? "Review the supplied implementation against the Rules Bible.";
  const data = readRepositoryEvidence(dataFile, requestedSystem);
  const engine = readRepositoryEvidence(enginePath, requestedSystem);
  const rulesBible = readRulesBible();
  const context = request?.context ?? "Determine whether the requested approved system is already implemented or what authorized integration work remains.";
  const completionGate = getRequiredEvidence(requestedSystem);

  return await askAI(`You are the BLOODLINES Implementation Assistant.

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

${completionGate}

GOVERNANCE:
- Analyze ONLY the requested system.
- APPROVED authorizes a system; it does not define unspecified mechanics.
- READY requires every implementation-critical mechanic to be explicitly authorized.
- ALREADY_IMPLEMENTED requires direct repository evidence proving every approved behavioral requirement exists and is integrated.
- Never infer behavior from names, interfaces, enums, comments, or related files.
- If evidence is incomplete, say exactly which behavioral requirement lacks evidence.
- If an implementation-critical mechanic is missing from the approved rules, use BLOCKED_BY_HUMAN_DECISION.
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

${IMPLEMENTATION_GOVERNANCE}`);
}
