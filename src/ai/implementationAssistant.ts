import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { askAI } from "./aiClient";

const RULES_BIBLE_PATH = "docs/RULES_BIBLE.md";
const MAX_REPOSITORY_EVIDENCE_CHARS = 3200;
const MAX_FILE_CHARS = 900;
const MAX_FILES = 6;
const MAX_RULES_SECTION_CHARS = 3200;
const MAX_CONTEXT_CHARS = 900;

export interface ImplementationRequest { system: string; context?: string; }

export function readRulesBible(): string {
  if (!fs.existsSync(RULES_BIBLE_PATH)) throw new Error(`Rules Bible not found: ${RULES_BIBLE_PATH}`);
  return fs.readFileSync(RULES_BIBLE_PATH, "utf8");
}

function getTargetKeywords(system: string): string[] {
  const normalized = system.toLowerCase();
  if (normalized.includes("action economy")) return ["action", "turn", "bonus", "reaction", "stamina", "energy", "combat", "resolver"];
  if (normalized.includes("advantage") || normalized.includes("disadvantage")) return ["advantage", "disadvantage", "roll", "dice", "d20", "rules", "runtime"];
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
      else if (/\.(ts|tsx|js|json|md)$/.test(entry.name)) files.push(fullPath);
    }
  }
  walk(inputPath);

  const ranked = files.map(file => {
    const normalized = file.toLowerCase();
    const basename = path.basename(file).toLowerCase();
    let score = 0;
    for (const keyword of keywords) {
      if (basename === keyword || basename === `${keyword}.ts` || basename === `${keyword}.json` || basename === `${keyword}.md`) score += 20;
      else if (basename.includes(keyword)) score += 6;
      else if (normalized.includes(keyword)) score += 2;
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

  const requirementLines = lines.slice(Math.max(0, start - 1), end).filter(line =>
    /approved|required|must|one action|bonus action|reaction|stamina|energy|resource|reset|consum|round|turn|advantage|disadvantage|defined|authorized|stack/i.test(line)
  );
  const compactRequirements = requirementLines.join("\n");
  return (compactRequirements || section).slice(0, MAX_RULES_SECTION_CHARS);
}

function gitState(): string {
  try {
    const head = execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
    const status = execFileSync("git", ["status", "--short"], { encoding: "utf8" }).trim();
    return `Repository HEAD: ${head}\nWorking tree: ${status || "clean"}`;
  } catch { return "Repository Git state unavailable."; }
}

function getGuard(system: string): string {
  const common = `RULES GUARD:
- Rules Bible is the gameplay authority; repository code/data is implementation evidence.
- Implement every approved requirement; never silently omit one.
- Never invent values, costs, abilities, triggers, timing, defaults, regeneration, scaling, or balancing.
- Unspecified gameplay details must be reported, not decided.
- Neutral architecture is allowed only when it does not encode an unstated rule.
- Architecture names/fields/APIs are engineering choices, not gameplay authority.
- Suggestions are allowed and encouraged, but clearly label them as suggestions.
- An accepted plan is not implementation completion: the repository must actually be patched.
- Do not claim a patch happened unless files were written successfully.
- After patching, report changed files, verification commands/results, and any unresolved items.`;
  if (system.toLowerCase().includes("action economy")) return `${common}
ACTION ECONOMY: account for all approved Action, Bonus Action, Reaction, consumption/reset, turn-reset, stamina-resource, and no-extra-slot requirements. Stamina has no invented numeric costs, max, or regeneration. Do not invent Bonus Action or Reaction abilities/triggers. "Once per round" must never become "once per turn".`;
  return common;
}

const ACTION_ECONOMY_CHECKLIST = `APPROVED ACTION ECONOMY CHECKLIST — ACCOUNT FOR EVERY ITEM:
1. One Action per combat turn (baseline).
2. One Bonus Action per combat turn, if granted.
3. Authorized Reaction availability.
4. Action consumption.
5. Bonus Action consumption.
6. Reaction consumption/reset according to the Rules Bible.
7. Turn-state reset.
8. Stamina/energy resource framework, with unspecified costs/regeneration left neutral.
9. Stamina cannot purchase extra baseline Actions or Bonus Actions.
This checklist restates approved requirements; it does not add mechanics.`;

const REQUIRED_SECTIONS = ["# Implementation Status", "# Approved Requirements", "# Repository Findings", "# Human Decisions Required", "# Files Affected", "# Required Changes", "# Tests", "# Risks", "# Verification"];

function validateImplementationPlan(system: string, output: string): string {
  if (!REQUIRED_SECTIONS.every(section => output.includes(section))) throw new Error("Implementation plan rejected: required report sections were omitted.");

  const forbidden = [
    /staminacost\s*[:=]\s*\d+/i,
    /stamina\s+cost\s+of\s+\d+/i,
    /quickspellaction/i,
    /opportunityattackaction/i,
    /stamina[^\n]{0,100}(regenerates|restores|recovers)[^\n]{0,80}\b\d+/i
  ];
  if (forbidden.some(pattern => pattern.test(output))) throw new Error("Implementation plan rejected: unspecified mechanics were invented.");

  if (!system.toLowerCase().includes("action economy")) return output;
  const required = [
    ["action", /(?:one\s+)?action\s+per\s+(?:combat\s+)?turn|baseline\s+of\s+one\s+per\s+(?:combat\s+)?turn|one\s+action|action\s+slot/i],
    ["bonus action", /bonus\s+action/i],
    ["reaction", /reaction/i],
    ["action consumption", /action\s+consumption|consum(e|ption).*action|action.*consum(e|ption)/i],
    ["bonus consumption", /bonus.*consum(e|ption)|consum(e|ption).*bonus/i],
    ["reaction reset", /reaction.*(reset|round)|reset.*reaction/i],
    ["turn reset", /turn.*reset|reset.*turn|reset.*start.*turn|start.*new\s+turn/i],
    ["stamina resource", /stamina|energy/i],
    ["no extra baseline slots", /stamina.*(extra|additional).*action|extra.*(action|bonus).*stamina|stamina.*buy|cannot.*purchase.*extra.*(action|bonus)|cannot.*gain.*extra.*(action|bonus)/i]
  ] as const;
  const missing = required.filter(([, pattern]) => !pattern.test(output)).map(([name]) => name);
  if (missing.length) throw new Error(`Implementation plan rejected: approved requirements were omitted: ${missing.join(", ")}`);
  return output;
}

function runLocal(command: string, args: string[]): string {
  try { return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(); }
  catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`${command} ${args.join(" ")} failed: ${detail}`);
  }
}

export async function implementDesign(dataFile: string, enginePath: string, request?: ImplementationRequest) {
  const system = request?.system ?? "Review the supplied implementation against the Rules Bible.";
  const rulesBible = readRulesBible();
  const data = readRepositoryEvidence(dataFile, system);
  const engine = readRepositoryEvidence(enginePath, system);
  const rules = getRulesSection(rulesBible, system);
  const context = (request?.context ?? "Determine implementation status and authorized integration work.").slice(0, MAX_CONTEXT_CHARS);
  const guard = getGuard(system);
  const checklist = system.toLowerCase().includes("action economy") ? `\n\n${ACTION_ECONOMY_CHECKLIST}` : "";
  const output = await askAI(`BLOODLINES IMPLEMENTATION ASSISTANT
You are an implementation agent, not merely a report generator.

Phase 1 — Analyze and propose:
- Inspect the actual repository evidence and Rules Bible.
- Identify approved implementation work.
- Identify safe engineering suggestions and label them clearly.
- Identify unresolved gameplay decisions without deciding them.

Phase 2 — Governance gate:
- Produce the required implementation report.
- Every approved requirement must be explicitly accounted for.
- If the plan invents gameplay mechanics, it must be rejected.

Phase 3 — Implementation:
- ONLY after the plan is accepted by governance, patch the repository directly.
- Do not stop at a proposed diff or instructions for a human.
- Write the authorized code/files into the repository.
- Do not modify unrelated systems.
- Do not commit/push unless the caller explicitly requests publishing.

Phase 4 — Verification:
- Run the project's appropriate typecheck/tests when available.
- Report exactly which files changed and which checks passed/failed.
- If verification fails, report the failure rather than claiming completion.

${rules}

SYSTEM:
${system}

CONTEXT:
${context}

REPOSITORY EVIDENCE:
${data}

ENGINE EVIDENCE:
${engine}

${gitState()}

${guard}${checklist}

Return the implementation report first using exactly these headings:
${REQUIRED_SECTIONS.join("\n")}

Required Changes may contain authorized behavior plus clearly labeled neutral engineering suggestions. Suggestions must never be presented as approved gameplay. Completion is only achieved when the authorized repository patch has actually been written and verified.`);

  try {
    return validateImplementationPlan(system, output);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown governance rejection";
    return `${output}\n\n# GOVERNANCE VALIDATION\nREJECTED — DO NOT IMPLEMENT\n${reason}`;
  }
}
