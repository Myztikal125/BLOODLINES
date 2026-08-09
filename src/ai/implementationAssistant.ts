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
export interface ImplementationPatch { path: string; content: string; reason: string; }
export interface ImplementationResult { report: string; patches: ImplementationPatch[]; applied: boolean; verification?: string; }

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
    const normalized = file.toLowerCase(); const basename = path.basename(file).toLowerCase(); let score = 0;
    for (const keyword of keywords) {
      if (basename === keyword || basename === `${keyword}.ts` || basename === `${keyword}.json` || basename === `${keyword}.md`) score += 20;
      else if (basename.includes(keyword)) score += 6; else if (normalized.includes(keyword)) score += 2;
    }
    return { file, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.file.localeCompare(b.file)).slice(0, MAX_FILES);
  let output = "";
  for (const { file, score } of ranked) {
    try { const section = `\n== ${file} (${score}) ==\n${fs.readFileSync(file, "utf8").slice(0, MAX_FILE_CHARS)}\n`; if (output.length + section.length <= MAX_REPOSITORY_EVIDENCE_CHARS) output += section; } catch {}
  }
  return output || "[No targeted repository evidence.]";
}

function getRulesSection(rulesBible: string, system: string): string {
  const lines = rulesBible.split("\n"); const normalizedSystem = system.toLowerCase(); const start = lines.findIndex(line => line.toLowerCase().includes(normalizedSystem));
  if (start < 0) return rulesBible.slice(0, MAX_RULES_SECTION_CHARS);
  let end = lines.length; for (let i = start + 1; i < lines.length; i++) { if (/^#{2,3}\s/.test(lines[i])) { end = i; break; } }
  const section = lines.slice(Math.max(0, start - 1), end).join("\n"); if (section.length <= MAX_RULES_SECTION_CHARS) return section;
  const requirementLines = lines.slice(Math.max(0, start - 1), end).filter(line => /approved|required|must|one action|bonus action|reaction|stamina|energy|resource|reset|consum|round|turn|advantage|disadvantage|defined|authorized|stack/i.test(line));
  return (requirementLines.join("\n") || section).slice(0, MAX_RULES_SECTION_CHARS);
}

function gitState(): string { try { const head = execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim(); const status = execFileSync("git", ["status", "--short"], { encoding: "utf8" }).trim(); return `Repository HEAD: ${head}\nWorking tree: ${status || "clean"}`; } catch { return "Repository Git state unavailable."; } }

function getGuard(system: string): string {
  const common = `RULES GUARD:\n- Rules Bible is the gameplay authority; repository code/data is implementation evidence.\n- Implement every approved requirement; never silently omit one.\n- Never invent values, costs, abilities, triggers, timing, defaults, regeneration, scaling, or balancing.\n- Unspecified gameplay details must be reported, not decided.\n- Suggestions are allowed and encouraged, but clearly label them as suggestions.\n- An accepted plan requires an actual repository patch.\n- Never claim a patch happened unless files were written successfully.\n- Only modify paths inside this repository.\n- Do not commit/push from the assistant.`;
  if (system.toLowerCase().includes("action economy")) return `${common}\nACTION ECONOMY: account for Action, Bonus Action, Reaction, consumption/reset, turn reset, stamina resource, and no-extra-slot requirements. Stamina has no invented numeric costs, max, or regeneration.`;
  return common;
}

const ACTION_ECONOMY_CHECKLIST = `APPROVED ACTION ECONOMY CHECKLIST:\n1. One Action per combat turn (baseline).\n2. One Bonus Action per combat turn, if granted.\n3. Authorized Reaction availability.\n4. Action consumption.\n5. Bonus Action consumption.\n6. Reaction consumption/reset.\n7. Turn-state reset.\n8. Stamina/energy resource framework with unspecified costs/regeneration left neutral.\n9. Stamina cannot purchase extra baseline Actions or Bonus Actions.`;
const REQUIRED_SECTIONS = ["# Implementation Status", "# Approved Requirements", "# Repository Findings", "# Human Decisions Required", "# Files Affected", "# Required Changes", "# Tests", "# Risks", "# Verification"];

export function validateImplementationPlan(system: string, output: string): string {
  if (!REQUIRED_SECTIONS.every(section => output.includes(section))) throw new Error("Implementation plan rejected: required report sections were omitted.");
  const forbidden = [/staminacost\s*[:=]\s*\d+/i, /stamina\s+cost\s+of\s+\d+/i, /quickspellaction/i, /opportunityattackaction/i, /stamina[^\n]{0,100}(regenerates|restores|recovers)[^\n]{0,80}\b\d+/i];
  if (forbidden.some(pattern => pattern.test(output))) throw new Error("Implementation plan rejected: unspecified mechanics were invented.");
  if (!system.toLowerCase().includes("action economy")) return output;
  const required: [string, RegExp][] = [["action", /one\s+action|baseline\s+of\s+one\s+per\s+(?:combat\s+)?turn/i],["bonus action",/bonus\s+action/i],["reaction",/reaction/i],["action consumption",/action\s+consumption|consum(e|ption).*action|action.*consum(e|ption)/i],["bonus consumption",/bonus.*consum(e|ption)|consum(e|ption).*bonus/i],["reaction reset",/reaction.*(reset|round)|reset.*reaction/i],["turn reset",/turn.*reset|reset.*turn|reset.*start.*turn|start.*new\s+turn/i],["stamina resource",/stamina|energy/i],["no extra baseline slots",/stamina.*(extra|additional).*action|extra.*(action|bonus).*stamina|stamina.*buy|cannot.*purchase.*extra.*(action|bonus)|cannot.*gain.*extra.*(action|bonus)/i]];
  const missing = required.filter(([, pattern]) => !pattern.test(output)).map(([name]) => name); if (missing.length) throw new Error(`Implementation plan rejected: approved requirements were omitted: ${missing.join(", ")}`);
  return output;
}

function safeRepositoryPath(filePath: string): string {
  const root = path.resolve(process.cwd()); const resolved = path.resolve(root, filePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`Patch rejected: path escapes repository: ${filePath}`);
  return resolved;
}

function parsePatchResponse(raw: string): ImplementationPatch[] {
  const match = raw.match(/<IMPLEMENTATION_PATCHES>\s*([\s\S]*?)\s*<\/IMPLEMENTATION_PATCHES>/i);
  if (!match) throw new Error("Implementation patch rejected: AI did not return an explicit patch payload.");
  let parsed: unknown;
  try { parsed = JSON.parse(match[1]); } catch { throw new Error("Implementation patch rejected: invalid JSON patch payload."); }
  if (!Array.isArray(parsed)) throw new Error("Implementation patch rejected: patch payload must be an array.");
  return parsed.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`Implementation patch rejected: invalid patch ${index}.`);
    const patch = item as Record<string, unknown>;
    if (typeof patch.path !== "string" || typeof patch.content !== "string" || typeof patch.reason !== "string") throw new Error(`Implementation patch rejected: patch ${index} requires path, content, reason.`);
    const target = safeRepositoryPath(patch.path);
    if (target === safeRepositoryPath(RULES_BIBLE_PATH) || target.startsWith(safeRepositoryPath(".git"))) throw new Error(`Implementation patch rejected: protected path ${patch.path}.`);
    return { path: patch.path, content: patch.content, reason: patch.reason };
  });
}

function applyPatches(patches: ImplementationPatch[]): string[] {
  const changed: string[] = [];
  for (const patch of patches) {
    const target = safeRepositoryPath(patch.path); const existed = fs.existsSync(target);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, patch.content, "utf8");
    if (!existed || fs.readFileSync(target, "utf8") === patch.content) changed.push(patch.path);
  }
  return changed;
}

function verifyImplementation(): string {
  const results: string[] = [];
  try { results.push(`tsc --noEmit: ${execFileSync("npx", ["tsc", "--noEmit"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim() || "PASS"}`); }
  catch (error) { throw new Error(`Typecheck failed after implementation: ${error instanceof Error ? error.message : String(error)}`); }
  try { results.push(`vitest run: ${execFileSync("npx", ["vitest", "run"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim() || "PASS"}`); }
  catch (error) { throw new Error(`Tests failed after implementation: ${error instanceof Error ? error.message : String(error)}`); }
  return results.join("\n");
}

export async function implementDesign(dataFile: string, enginePath: string, request?: ImplementationRequest): Promise<ImplementationResult> {
  const system = request?.system ?? "Review the supplied implementation against the Rules Bible.";
  const rulesBible = readRulesBible(); const data = readRepositoryEvidence(dataFile, system); const engine = readRepositoryEvidence(enginePath, system); const rules = getRulesSection(rulesBible, system); const context = (request?.context ?? "Determine implementation status and authorized integration work.").slice(0, MAX_CONTEXT_CHARS); const guard = getGuard(system); const checklist = system.toLowerCase().includes("action economy") ? `\n\n${ACTION_ECONOMY_CHECKLIST}` : "";
  const planPrompt = `BLOODLINES IMPLEMENTATION ASSISTANT — PLAN AND EXECUTION\nPhase 1: inspect repository and Rules Bible; identify approved work and useful suggestions.\nPhase 2: produce the required report.\nPhase 3: after governance acceptance, return an explicit patch payload containing ONLY authorized changes. Do not stop at instructions for a human.\nPhase 4: the host will write the patch and run verification.\n\n${rules}\nSYSTEM: ${system}\nCONTEXT: ${context}\nREPOSITORY EVIDENCE:\n${data}\nENGINE EVIDENCE:\n${engine}\n${gitState()}\n${guard}${checklist}\n\nReturn the report first using exactly these headings:\n${REQUIRED_SECTIONS.join("\n")}\n\nIf the plan is valid and implementation is authorized, append:\n<IMPLEMENTATION_PATCHES>\n[{"path":"relative/path","content":"complete file contents","reason":"why this exact change is authorized"}]\n</IMPLEMENTATION_PATCHES>\nIf implementation is blocked or governance rejects the plan, omit the patch block.`;
  const output = await askAI(planPrompt);
  let report = output;
  try { report = validateImplementationPlan(system, output); } catch (error) { return { report: `${output}\n\n# GOVERNANCE VALIDATION\nREJECTED — DO NOT IMPLEMENT\n${error instanceof Error ? error.message : String(error)}`, patches: [], applied: false }; }
  const patches = parsePatchResponse(output);
  if (!patches.length) return { report: `${report}\n\n# IMPLEMENTATION EXECUTION\nBLOCKED — No explicit implementation patch was supplied.`, patches: [], applied: false };
  const changed = applyPatches(patches);
  let verification: string;
  try { verification = verifyImplementation(); }
  catch (error) { return { report: `${report}\n\n# IMPLEMENTATION EXECUTION\nPATCHED: ${changed.join(", ")}\nVERIFICATION FAILED: ${error instanceof Error ? error.message : String(error)}`, patches, applied: true }; }
  return { report: `${report}\n\n# IMPLEMENTATION EXECUTION\nPATCHED: ${changed.join(", ")}\nVERIFICATION:\n${verification}`, patches, applied: true, verification };
}
