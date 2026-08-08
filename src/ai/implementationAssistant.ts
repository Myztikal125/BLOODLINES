import fs from "fs";
import path from "path";
import { askAI } from "./aiClient";

const RULES_BIBLE_PATH = "docs/RULES_BIBLE.md";
const MAX_REPOSITORY_EVIDENCE_CHARS = 1600;
const MAX_FILE_CHARS = 500;
const MAX_FILES = 2;
const MAX_RULES_SECTION_CHARS = 2600;
const MAX_CONTEXT_CHARS = 600;

export interface ImplementationRequest { system: string; context?: string; }

export function readRulesBible(): string {
  if (!fs.existsSync(RULES_BIBLE_PATH)) throw new Error(`Rules Bible not found: ${RULES_BIBLE_PATH}`);
  return fs.readFileSync(RULES_BIBLE_PATH, "utf8");
}

function getTargetKeywords(system: string): string[] {
  const normalized = system.toLowerCase();
  if (normalized.includes("action economy")) return ["action", "turn", "bonus", "reaction", "stamina", "energy", "combat"];
  return normalized.split(/[^a-z0-9]+/).filter(word => word.length >= 4);
}

function readRepositoryEvidence(inputPath: string, system: string): string {
  if (!fs.existsSync(inputPath)) throw new Error(`Repository evidence path not found: ${inputPath}`);
  if (fs.statSync(inputPath).isFile()) return fs.readFileSync(inputPath, "utf8").slice(0, MAX_FILE_CHARS);

  const files: string[] = [];
  const keywords = getTargetKeywords(system);
  function walk(directory: string) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (["node_modules", ".git", "dist", "coverage"].includes(entry.name)) continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (/\.(ts|tsx|js)$/.test(entry.name)) files.push(fullPath);
    }
  }
  walk(inputPath);

  const ranked = files.map(file => {
    const normalized = file.toLowerCase();
    const basename = path.basename(file).toLowerCase();
    let score = 0;
    for (const keyword of keywords) {
      if (basename.includes(keyword)) score += 4;
      else if (normalized.includes(keyword)) score += 1;
    }
    return { file, score };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))
    .slice(0, MAX_FILES);

  let output = "";
  for (const { file, score } of ranked) {
    try {
      const section = `\n== ${file} (${score}) ==\n${fs.readFileSync(file, "utf8").slice(0, MAX_FILE_CHARS)}\n`;
      if (output.length + section.length <= MAX_REPOSITORY_EVIDENCE_CHARS) output += section;
    } catch {}
  }
  return output || "[No targeted repository evidence.]";
}

function getRulesSection(rulesBible: string, system: string): string {
  const lines = rulesBible.split("\n");
  const normalizedSystem = system.toLowerCase();
  const start = lines.findIndex(line => line.toLowerCase().includes(normalizedSystem));
  if (start < 0) return rulesBible.slice(0, MAX_RULES_SECTION_CHARS);

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{2,3}\s/.test(lines[i])) { end = i; break; }
  }

  const section = lines.slice(Math.max(0, start - 1), end).join("\n");
  if (section.length <= MAX_RULES_SECTION_CHARS) return section;

  // Do not silently truncate approved requirements. Preserve requirement-like
  // lines first, then fill the remaining budget with surrounding context.
  const requirementLines = lines.slice(Math.max(0, start - 1), end).filter(line =>
    /approved|required|must|one action|bonus action|reaction|stamina|energy|resource|reset|consum|round|turn|advantage|disadvantage|defined|authorized/i.test(line)
  );
  const compactRequirements = requirementLines.join("\n");
  if (compactRequirements.length <= MAX_RULES_SECTION_CHARS) return compactRequirements;
  return compactRequirements.slice(0, MAX_RULES_SECTION_CHARS);
}

function getGuard(system: string): string {
  const common = `RULES GUARD:
- Rules Bible is the only gameplay authority; repository code is evidence only.
- Implement every approved requirement; never silently omit one.
- Never invent values, costs, abilities, triggers, timing, defaults, regeneration, or balancing.
- Unspecified gameplay details must be reported, not decided.
- Neutral architecture is allowed only if it does not encode an unstated rule.
- Preserve approved scope, timing, frequency, authorization, and exclusions exactly.
- Architecture names/fields/APIs are engineering choices, not gameplay authority.
- Do not claim code was changed.`;
  if (system.toLowerCase().includes("action economy")) return `${common}
ACTION ECONOMY: account for all approved Action, Bonus Action, Reaction, consumption/reset, turn-reset, stamina-resource, and no-extra-slot requirements. Stamina has no invented numeric costs, max, or regeneration. Do not invent Bonus Action or Reaction abilities/triggers. "Once per round" must never become "once per turn".`;
  return common;
}

function validateImplementationPlan(system: string, output: string): string {
  if (!system.toLowerCase().includes("action economy")) return output;
  const forbidden = [
    /staminacost\s*[:=]\s*\d+/i,
    /stamina\s+cost\s+of\s+\d+/i,
    /quickspellaction/i,
    /opportunityattackaction/i,
    /stamina[^\n]{0,100}(regenerates|restores|recovers)[^\n]{0,80}\b\d+/i
  ];
  if (forbidden.some(pattern => pattern.test(output))) throw new Error("Implementation plan rejected: unspecified Action Economy mechanics were invented.");

  const required = [
    ["action", /one\s+action|action\s+per\s+turn|action\s+slot/i],
    ["bonus action", /bonus\s+action/i],
    ["reaction", /reaction/i],
    ["action consumption", /action\s+consumption|consum(e|ption).*action|action.*consum(e|ption)/i],
    ["bonus consumption", /bonus.*consum(e|ption)|consum(e|ption).*bonus/i],
    ["reaction reset", /reaction.*(reset|round)|reset.*reaction/i],
    ["turn reset", /turn.*reset|reset.*turn/i],
    ["stamina resource", /stamina|energy/i],
    ["no extra baseline slots", /stamina.*(extra|additional).*action|extra.*(action|bonus).*stamina|stamina.*buy/i]
  ] as const;
  const missing = required.filter(([, pattern]) => !pattern.test(output)).map(([name]) => name);
  if (missing.length) throw new Error(`Implementation plan rejected: approved requirements were omitted: ${missing.join(", ")}`);

  if (/once\s+per\s+turn/i.test(output) && /once\s+per\s+round/i.test(output) === false && /reaction/i.test(output)) {
    throw new Error("Implementation plan rejected: Reaction frequency may have been changed from the approved round-based rule.");
  }
  return output;
}

export async function implementDesign(dataFile: string, enginePath: string, request?: ImplementationRequest) {
  const system = request?.system ?? "Review the supplied implementation against the Rules Bible.";
  const rulesBible = readRulesBible();
  const data = readRepositoryEvidence(dataFile, system);
  const engine = readRepositoryEvidence(enginePath, system);
  const rules = getRulesSection(rulesBible, system);
  const context = (request?.context ?? "Determine implementation status and authorized integration work.").slice(0, MAX_CONTEXT_CHARS);
  const guard = getGuard(system);

  const output = await askAI(`BLOODLINES IMPLEMENTATION ANALYST
Analyze ONE system. Do not design mechanics.

RULES BIBLE:
${rules}

SYSTEM:
${system}

CONTEXT:
${context}

REPOSITORY EVIDENCE:
${data}

ENGINE EVIDENCE:
${engine}

${guard}

Completion requires every approved requirement to be explicitly accounted for. Missing approved behavior is an implementation gap, not permission to invent a rule.

Return exactly:
# Implementation Status
# Approved Requirements
# Repository Findings
# Human Decisions Required
# Files Affected
# Required Changes
# Tests
# Risks
# Verification

Required Changes may contain only authorized behavior plus clearly labeled neutral implementation choices. If a gameplay detail is unspecified, say so. Never substitute one timing/frequency for another.`);

  return validateImplementationPlan(system, output);
}
