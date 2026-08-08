import fs from "fs";
import path from "path";
import { askAI } from "./aiClient";
import { IMPLEMENTATION_GOVERNANCE } from "./implementationGovernance";

const RULES_BIBLE_PATH = "docs/RULES_BIBLE.md";

// Keep implementation-analysis prompts small enough for the available AI providers.
const MAX_REPOSITORY_EVIDENCE_CHARS = 4200;
const MAX_FILE_CHARS = 1200;
const MAX_FILES = 4;
const MAX_RULES_SECTION_CHARS = 2600;

export interface ImplementationRequest { system: string; context?: string; }

export function readRulesBible(): string {
  if (!fs.existsSync(RULES_BIBLE_PATH)) throw new Error(`Rules Bible not found: ${RULES_BIBLE_PATH}`);
  return fs.readFileSync(RULES_BIBLE_PATH, "utf8");
}

function getTargetKeywords(system: string): string[] {
  const normalized = system.toLowerCase();
  const base = normalized.split(/[^a-z0-9]+/).filter(word => word.length >= 4);

  if (normalized.includes("action economy")) {
    return [
      "action", "actions", "actionresolver", "combataction", "turn", "turns",
      "bonus", "reaction", "stamina", "energy", "resource", "combat"
    ];
  }

  return base;
}

function readRepositoryEvidence(inputPath: string, system: string): string {
  if (!fs.existsSync(inputPath)) throw new Error(`Repository evidence path not found: ${inputPath}`);
  if (fs.statSync(inputPath).isFile()) return fs.readFileSync(inputPath, "utf8").slice(0, MAX_FILE_CHARS);

  const files: string[] = [];
  const keywords = getTargetKeywords(system);

  function walk(directory: string) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        entry.name === "dist" ||
        entry.name === "coverage"
      ) continue;

      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (/\.(ts|tsx|js|json|md)$/.test(entry.name)) files.push(fullPath);
    }
  }

  walk(inputPath);

  const ranked = files.map(file => {
    const normalized = file.toLowerCase();
    const basename = path.basename(file).toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      if (basename.includes(keyword)) score += 5;
      else if (normalized.includes(keyword)) score += 1;
    }

    // For implementation analysis, executable source is more useful than docs/data.
    if (/\.(ts|tsx|js)$/.test(file)) score += 2;

    return { file, score };
  })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))
    .slice(0, MAX_FILES);

  let output = "";
  for (const { file, score } of ranked) {
    try {
      const content = fs.readFileSync(file, "utf8").slice(0, MAX_FILE_CHARS);
      const section = `\n===== ${file} (relevance ${score}) =====\n${content}\n`;
      if (output.length + section.length <= MAX_REPOSITORY_EVIDENCE_CHARS) output += section;
    } catch {
      // Ignore unreadable candidates and continue with targeted evidence.
    }
  }

  return output || "[No readable targeted repository evidence matched the requested system.]";
}

function getRulesSection(rulesBible: string, system: string): string {
  const lines = rulesBible.split("\n");
  const target = system.toLowerCase();
  const start = lines.findIndex(line => line.toLowerCase().includes(target));
  if (start < 0) return rulesBible.slice(0, MAX_RULES_SECTION_CHARS);

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{2,3}\s/.test(lines[i])) { end = i; break; }
  }

  return lines.slice(Math.max(0, start - 3), end).join("\n").slice(0, MAX_RULES_SECTION_CHARS);
}

function getRequiredEvidence(system: string): string {
  if (system.toLowerCase().includes("action economy")) {
    return `ACTION ECONOMY COMPLETION GATE:
ALREADY_IMPLEMENTED requires direct code evidence for ALL nine approved behaviors:
1. exactly one Action per combat turn;
2. exactly one Bonus Action per combat turn;
3. Reaction availability outside the turn on an authorized trigger;
4. Action consumption/prevention of a second baseline Action;
5. Bonus Action consumption/prevention of a second baseline Bonus Action;
6. Reaction consumption/reset;
7. turn transition/reset of action state;
8. an energy/stamina RESOURCE FRAMEWORK exists, with no unapproved stamina costs;
9. stamina cannot buy extra baseline Actions or Bonus Actions.
Definitions/enums/resolvers alone are insufficient for ALREADY_IMPLEMENTED.

APPROVAL BOUNDARY:
- Requirements 1-9 are already approved. Never ask the human to re-approve or redefine them.
- Requirement 8 authorizes implementation of a resource framework/state. Do NOT invent or require numerical costs, maximums, regeneration rates, or other unstated stamina mechanics.
- Requirements 1-7 authorize their stated tracking, consumption, availability, and reset behavior.
- Requirement 9 explicitly forbids stamina from purchasing extra baseline Actions or Bonus Actions.
- If approved behavior is missing from code but fully specified by requirements 1-9, return READY.
- BLOCKED_BY_HUMAN_DECISION is reserved exclusively for behavior absent from BOTH the approved requirements AND the Rules Bible.
- Missing code is not a human decision.`;
  }

  return `COMPLETION GATE: ALREADY_IMPLEMENTED requires direct repository evidence for every approved behavioral requirement. Names, types, enums, comments, or related files alone are insufficient.

HUMAN-DECISION FILTER: Never reopen, contradict, or ask the human to re-decide requirements already explicitly approved in the Rules Bible or request context.`;
}

export async function implementDesign(dataFile: string, enginePath: string, request?: ImplementationRequest) {
  const requestedSystem = request?.system ?? "Review the supplied implementation against the Rules Bible.";
  const rulesBible = readRulesBible();
  const data = readRepositoryEvidence(dataFile, requestedSystem);
  const engine = readRepositoryEvidence(enginePath, requestedSystem);
  const rulesSection = getRulesSection(rulesBible, requestedSystem);
  const context = request?.context ?? "Determine whether the requested approved system is already implemented or what authorized integration work remains.";
  const completionGate = getRequiredEvidence(requestedSystem);

  return await askAI(`You are the BLOODLINES Implementation Assistant.

Analyze ONE requested system as an implementation analyst, not a game designer.

AUTHORITATIVE RULES SECTION:
${rulesSection}

SYSTEM REQUESTED:
${requestedSystem}

CONTEXT:
${context}

TARGETED REPOSITORY EVIDENCE:
${data}

TARGETED ENGINE EVIDENCE:
${engine}

${completionGate}

GOVERNANCE:
- Analyze ONLY the requested system.
- APPROVED does not authorize unspecified mechanics, but explicit approved requirements DO authorize their stated behavior.
- READY only when all missing implementation work is explicitly authorized.
- ALREADY_IMPLEMENTED only with direct code evidence for every approved behavioral requirement.
- If approved behavior is missing from code, that is an implementation gap, not automatically a human decision.
- Never infer behavior from names, interfaces, enums, comments, or filenames.
- Never invent mechanics, numbers, costs, durations, triggers, formulas, or stacking rules.
- Never silently import D&D rules.
- Never invent affected files.
- Never claim code was changed.
- If BLOCKED_BY_HUMAN_DECISION, list concrete unresolved questions only.

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
