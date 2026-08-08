import fs from "fs";
import path from "path";
import { askAI } from "./aiClient";

const RULES_BIBLE_PATH = "docs/RULES_BIBLE.md";
const MAX_REPOSITORY_EVIDENCE_CHARS = 2400;
const MAX_FILE_CHARS = 650;
const MAX_FILES = 3;
const MAX_RULES_SECTION_CHARS = 1500;
const MAX_CONTEXT_CHARS = 1000;

export interface ImplementationRequest { system: string; context?: string; }

export function readRulesBible(): string {
  if (!fs.existsSync(RULES_BIBLE_PATH)) throw new Error(`Rules Bible not found: ${RULES_BIBLE_PATH}`);
  return fs.readFileSync(RULES_BIBLE_PATH, "utf8");
}

function getTargetKeywords(system: string): string[] {
  const normalized = system.toLowerCase();
  if (normalized.includes("action economy")) return ["action", "actions", "actionresolver", "combataction", "turn", "bonus", "reaction", "stamina", "energy", "resource", "combat"];
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
      if (basename.includes(keyword)) score += 5;
      else if (normalized.includes(keyword)) score += 1;
    }
    return { file, score };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))
    .slice(0, MAX_FILES);

  let output = "";
  for (const { file, score } of ranked) {
    try {
      const content = fs.readFileSync(file, "utf8").slice(0, MAX_FILE_CHARS);
      const section = `\n===== ${file} (${score}) =====\n${content}\n`;
      if (output.length + section.length <= MAX_REPOSITORY_EVIDENCE_CHARS) output += section;
    } catch {}
  }
  return output || "[No targeted repository evidence matched the requested system.]";
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
  return lines.slice(Math.max(0, start - 2), end).join("\n").slice(0, MAX_RULES_SECTION_CHARS);
}

function getRequiredEvidence(system: string): string {
  if (system.toLowerCase().includes("action economy")) return `ACTION ECONOMY GATE: Verify direct code evidence for: one Action/turn; one Bonus Action/turn; authorized Reaction availability; Action consumption; Bonus Action consumption; Reaction consumption/reset; turn reset; an energy/stamina resource framework with no invented costs; stamina cannot buy extra baseline Actions/Bonus Actions. Missing approved behavior is an implementation gap, not a human decision. Do not invent unstated mechanics.`;
  return `COMPLETION GATE: ALREADY_IMPLEMENTED requires direct code evidence for every approved behavioral requirement. Never reopen requirements already approved.`;
}

function getImplementationGuard(system: string): string {
  if (system.toLowerCase().includes("action economy")) return `ACTION ECONOMY IMPLEMENTATION GUARD:
- Implement only the approved requirements explicitly evidenced in the Rules Bible.
- The Rules Bible authorizes an energy/stamina resource framework but does NOT authorize specific stamina costs, maximums, regeneration amounts, or regeneration timing unless directly stated in the supplied Rules Bible section.
- Do not assign any numeric stamina cost to AttackAction or any other action.
- Do not invent Bonus Action abilities, Reaction abilities, reaction triggers, event windows, or example actions.
- Do not create placeholder mechanics and label them as required changes.
- Do not use fallback/default values such as staminaCost: 0 or staminaCost: 2 to make unspecified mechanics compile.
- Neutral infrastructure is allowed only when it does not encode an unstated gameplay rule.
- If a required implementation detail is unspecified, report it as an unspecified detail and leave it neutral; do not make the design decision.
- Stamina must never be implemented as a way to purchase additional baseline Action or Bonus Action slots.
- Required Changes must describe only authorized changes. Separate any unresolved/unspecified details into Human Decisions Required.
- Never turn research notes, examples, filenames, or inferred conventions into Rules Bible authority.`;
  return `IMPLEMENTATION GUARD:
- Implement only requirements explicitly authorized by the Rules Bible.
- Do not invent values, costs, triggers, abilities, timing rules, defaults, balancing, or resource behavior.
- If a detail is unspecified, report it rather than deciding it.
- Neutral infrastructure is allowed only when it does not encode an unstated gameplay rule.
- Never turn research notes, examples, filenames, or inferred conventions into Rules Bible authority.`;
}

function validateImplementationPlan(system: string, output: string): string {
  const normalized = output.toLowerCase();
  if (!system.toLowerCase().includes("action economy")) return output;

  const forbiddenPatterns = [
    /staminacost\s*[:=]\s*\d+/i,
    /stamina\s+cost\s+of\s+\d+/i,
    /attackaction[^\n]{0,160}stamina[^\n]{0,80}\b\d+/i,
    /quickspellaction/i,
    /opportunityattackaction/i,
    /regenerate[^\n]{0,100}stamina[^\n]{0,100}(turn|round|percent|%|amount)/i,
    /stamina[^\n]{0,100}(regenerates|restores|recovers)[^\n]{0,100}\b\d+/i
  ];

  const violations = forbiddenPatterns.filter(pattern => pattern.test(output));
  if (violations.length === 0) return output;

  throw new Error(
    `Implementation plan rejected by Action Economy safety gate: the AI proposed unspecified mechanics. ` +
    `Do not implement invented stamina costs, placeholder abilities, reaction triggers, or regeneration values. ` +
    `Re-run the analysis with the Rules Bible as the only authority.`
  );
}

export async function implementDesign(dataFile: string, enginePath: string, request?: ImplementationRequest) {
  const requestedSystem = request?.system ?? "Review the supplied implementation against the Rules Bible.";
  const rulesBible = readRulesBible();
  const data = readRepositoryEvidence(dataFile, requestedSystem);
  const engine = readRepositoryEvidence(enginePath, requestedSystem);
  const rulesSection = getRulesSection(rulesBible, requestedSystem);
  const context = (request?.context ?? "Determine whether the requested approved system is already implemented or what authorized integration work remains.").slice(0, MAX_CONTEXT_CHARS);
  const completionGate = getRequiredEvidence(requestedSystem);
  const implementationGuard = getImplementationGuard(requestedSystem);

  const output = await askAI(`BLOODLINES IMPLEMENTATION ANALYST\nAnalyze ONE requested system. Do not design mechanics.\n\nRULES BIBLE:\n${rulesSection}\n\nSYSTEM:\n${requestedSystem}\n\nCONTEXT:\n${context}\n\nTARGETED REPOSITORY EVIDENCE:\n${data}\n\nTARGETED ENGINE EVIDENCE:\n${engine}\n\n${completionGate}\n\n${implementationGuard}\n\nAUTHORITY ORDER:\n1. Rules Bible requirements explicitly supplied above.\n2. Direct repository code evidence.\n3. Nothing else. Research notes and AI suggestions are not authority.\n\nReturn exactly:\n# Implementation Status\n# Approved Requirements\n# Repository Findings\n# Human Decisions Required\n# Files Affected\n# Required Changes\n# Tests\n# Risks\n# Verification\n\nFor Required Changes, state only changes authorized by the Rules Bible. If a value, cost, trigger, ability, reset timing, regeneration rule, or other gameplay detail is not explicitly authorized, say it is unspecified instead of selecting a value.\n\nNever infer behavior from names or filenames. Never invent mechanics. Never claim code was changed. Never present an example value as an implementation requirement.`);

  return validateImplementationPlan(requestedSystem, output);
}
