import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { askAI } from "./aiClient";
import { IMPLEMENTATION_ENGINEERING_PROTOCOL } from "./implementationProtocol";

const RULES_BIBLE_PATH = "docs/RULES_BIBLE.md";
const MAX_CONTEXT_CHARS = 1200;
const MAX_FILE_CHARS = 14000;
const MAX_FILES = 10;

export interface ImplementationRequest { system: string; context?: string; }
export interface ImplementationEdit { find: string; replace: string; }
export interface ImplementationPatch { path: string; content?: string; edits?: ImplementationEdit[]; reason: string; }
export interface ImplementationResult { report: string; patches: ImplementationPatch[]; applied: boolean; verification?: string; }

const REQUIRED_SECTIONS = [
  "# Implementation Status", "# Approved Requirements", "# Repository Findings",
  "# Human Decisions Required", "# Files Affected", "# Required Changes",
  "# Tests", "# Risks", "# Verification"
];

export function readRulesBible(): string {
  if (!fs.existsSync(RULES_BIBLE_PATH)) throw new Error(`Rules Bible not found: ${RULES_BIBLE_PATH}`);
  return fs.readFileSync(RULES_BIBLE_PATH, "utf8");
}

function safePath(filePath: string): string {
  const root = path.resolve(process.cwd());
  const resolved = path.resolve(root, filePath);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) throw new Error(`Patch rejected: path escapes repository: ${filePath}`);
  if (resolved === path.resolve(root, RULES_BIBLE_PATH) || resolved.startsWith(path.resolve(root, ".git") + path.sep)) {
    throw new Error(`Patch rejected: protected path ${filePath}`);
  }
  return resolved;
}

function walkFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (["node_modules", ".git", "dist", "coverage"].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|js|json|md)$/.test(entry.name)) files.push(full);
    }
  };
  walk(root);
  return files;
}

function keywords(system: string): string[] {
  const s = system.toLowerCase();
  if (s.includes("action economy")) return ["action", "economy", "turn", "bonus", "reaction", "stamina", "combat", "loop"];
  return s.split(/[^a-z0-9]+/).filter(word => word.length >= 4);
}

function collectEvidence(system: string, dataFile: string, enginePath: string, context: string): string {
  const wanted = keywords(system);
  const candidates = new Set<string>();
  for (const file of [dataFile]) {
    try { if (fs.existsSync(file) && fs.statSync(file).isFile()) candidates.add(file); } catch {}
  }
  if (fs.existsSync(enginePath)) {
    const files = fs.statSync(enginePath).isDirectory() ? walkFiles(enginePath) : [enginePath];
    const ranked = files.map(file => {
      let text = "";
      try { text = fs.readFileSync(file, "utf8").toLowerCase(); } catch {}
      const base = path.basename(file).toLowerCase();
      let score = 0;
      for (const key of wanted) {
        if (base.includes(key)) score += 8;
        else if (text.includes(key)) score += 1;
      }
      if (system.toLowerCase().includes("action economy") && (text.includes("actioneconomystate") || text.includes("startturn()"))) score += 15;
      return { file, score };
    }).sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));
    for (const item of ranked.slice(0, MAX_FILES)) candidates.add(item.file);
  }
  let out = `REQUEST CONTEXT:\n${context}\n`;
  for (const file of candidates) {
    try {
      const resolved = safePath(file);
      const content = fs.readFileSync(resolved, "utf8");
      out += `\n== ${file} ==\n${content.slice(0, MAX_FILE_CHARS)}\n`;
      if (out.length > 50000) break;
    } catch {}
  }
  return out;
}

function getRulesSection(rulesBible: string, system: string): string {
  const lines = rulesBible.split("\n");
  const index = lines.findIndex(line => line.toLowerCase().includes(system.toLowerCase()));
  if (index < 0) return rulesBible.slice(0, 5000);
  let end = lines.length;
  for (let i = index + 1; i < lines.length; i++) if (/^#{2,3}\s/.test(lines[i])) { end = i; break; }
  return lines.slice(Math.max(0, index - 1), end).join("\n").slice(0, 5000);
}

function gitState(): string {
  try {
    const head = execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
    const status = execFileSync("git", ["status", "--short"], { encoding: "utf8" }).trim();
    return `Repository HEAD: ${head}\nWorking tree: ${status || "clean"}`;
  } catch { return "Repository Git state unavailable."; }
}

export function validateImplementationPlan(system: string, output: string): string {
  const positions = REQUIRED_SECTIONS.map(section => output.indexOf(section));
  if (positions.some(position => position < 0) || positions.some((position, i) => i > 0 && position <= positions[i - 1])) {
    throw new Error("Implementation plan rejected: required report sections are missing or out of order.");
  }
  if (/stamina\s+cost\s+of\s+\d+|staminacost\s*[:=]\s*\d+/i.test(output)) {
    throw new Error("Implementation plan rejected: unspecified mechanics were invented.");
  }
  if (system.toLowerCase().includes("action economy")) {
    const required: [string, RegExp][] = [
      ["Action", /one\s+action|baseline.*one.*turn/i],
      ["Bonus Action", /bonus\s+action/i], ["Reaction", /reaction/i],
      ["Action consumption", /action.*consum|consum.*action/i],
      ["Bonus consumption", /bonus.*consum|consum.*bonus/i],
      ["Reaction reset", /reaction.*reset|reset.*reaction/i],
      ["Turn reset", /turn.*reset|reset.*turn/i], ["Stamina", /stamina|energy/i],
      ["No extra baseline slots", /stamina.*(extra|additional).*action|cannot.*(?:purchase|gain).*extra.*action/i]
    ];
    const missing = required.filter(([, regex]) => !regex.test(output)).map(([name]) => name);
    if (missing.length) throw new Error(`Implementation plan rejected: approved requirements were omitted: ${missing.join(", ")}`);
  }
  return output;
}

function parsePatchResponse(raw: string): ImplementationPatch[] {
  const match = raw.match(/<IMPLEMENTATION_PATCHES>\s*([\s\S]*?)\s*<\/IMPLEMENTATION_PATCHES>/i);
  if (!match) throw new Error("Implementation patch rejected: no explicit patch payload.");
  let parsed: unknown;
  try { parsed = JSON.parse(match[1]); } catch { throw new Error("Implementation patch rejected: patch payload must be valid JSON, not a unified diff or Markdown."); }
  if (!Array.isArray(parsed)) throw new Error("Implementation patch rejected: payload must be an array.");
  return parsed.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`Invalid patch ${index}.`);
    const patch = item as Record<string, unknown>;
    if (typeof patch.path !== "string" || typeof patch.reason !== "string") throw new Error(`Invalid patch ${index}: path and reason are required.`);
    if (typeof patch.content !== "string" && !Array.isArray(patch.edits)) throw new Error(`Invalid patch ${index}: content or edits are required.`);
    if (Array.isArray(patch.edits)) {
      for (const edit of patch.edits) {
        if (!edit || typeof edit !== "object" || typeof (edit as Record<string, unknown>).find !== "string" || typeof (edit as Record<string, unknown>).replace !== "string") {
          throw new Error(`Invalid patch ${index}: every edit requires find and replace strings.`);
        }
      }
    }
    safePath(patch.path);
    return {
      path: patch.path,
      reason: patch.reason,
      content: typeof patch.content === "string" ? patch.content : undefined,
      edits: Array.isArray(patch.edits) ? patch.edits as ImplementationEdit[] : undefined
    };
  });
}

function materializePatch(patch: ImplementationPatch): string {
  const target = safePath(patch.path);
  if (!fs.existsSync(target)) {
    if (typeof patch.content !== "string") throw new Error(`Patch rejected for ${patch.path}: new files require complete content.`);
    return patch.content;
  }
  let current = fs.readFileSync(target, "utf8");
  if (patch.edits?.length) {
    for (const edit of patch.edits) {
      const count = current.split(edit.find).length - 1;
      if (count !== 1) throw new Error(`Patch rejected for ${patch.path}: expected one exact match, found ${count}.`);
      current = current.replace(edit.find, edit.replace);
    }
    return current;
  }
  if (typeof patch.content !== "string") throw new Error(`Patch rejected for ${patch.path}: no content supplied.`);
  return patch.content;
}

function validateApiPreservation(patches: ImplementationPatch[]): void {
  for (const patch of patches) {
    const target = safePath(patch.path);
    if (!fs.existsSync(target)) continue;
    const before = fs.readFileSync(target, "utf8");
    const after = materializePatch(patch);
    const exports = [...before.matchAll(/export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g)].map(match => match[1]);
    for (const symbol of exports) {
      const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp(`export\\s+(?:default\\s+)?(?:class|function|const|let|var|interface|type|enum)\\s+${escaped}\\b`).test(after)) {
        throw new Error(`Patch rejected for ${patch.path}: existing exported symbol ${symbol} would be removed.`);
      }
    }
    if (!patch.edits?.length && after.length < Math.max(200, before.length * 0.5)) throw new Error(`Patch rejected for ${patch.path}: suspiciously small replacement.`);
  }
}

function applyPatches(patches: ImplementationPatch[]): string[] {
  validateApiPreservation(patches);
  const changed: string[] = [];
  for (const patch of patches) {
    const target = safePath(patch.path);
    const before = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : undefined;
    const after = materializePatch(patch);
    if (before === after) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, after, "utf8");
    changed.push(patch.path);
  }
  return changed;
}

function runVerification(): string {
  const run = (command: string, args: string[]) => execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim() || "PASS";
  try {
    const typecheck = run("npx", ["tsc", "--noEmit"]);
    const tests = run("npx", ["vitest", "run"]);
    return `tsc --noEmit: ${typecheck}\nvitest run: ${tests}`;
  } catch (error) {
    const e = error as { message?: string; stdout?: string; stderr?: string };
    throw new Error([e.message, e.stdout, e.stderr].filter(Boolean).join("\n").slice(-12000));
  }
}

function actionEconomyRuntimeComplete(): boolean {
  const combatLoop = path.resolve(process.cwd(), "engine/combat/combatLoop.ts");
  if (!fs.existsSync(combatLoop)) return false;
  const source = fs.readFileSync(combatLoop, "utf8");
  const hasEconomyReference = /ActionEconomyState|\.economy\b|actionEconomy/i.test(source);
  const hasTurnReset = /startTurn\s*\(/.test(source);
  return hasEconomyReference && hasTurnReset;
}

function noPatchClaimIsFactuallyValid(system: string, report: string): boolean {
  const status = report.match(/# Implementation Status\s+([\s\S]*?)(?=\n# Approved Requirements)/i)?.[1] ?? "";
  const changes = report.match(/# Required Changes\s+([\s\S]*?)(?=\n# Tests)/i)?.[1] ?? "";
  const claimsComplete = /(already|fully|completely)\s+(implemented|complete|satisfied)/i.test(status) && /(?:none|no\s+(?:code|repository)\s+changes?\s+(?:are\s+)?required|no\s+changes?\s+required)/i.test(changes);
  if (!claimsComplete) return false;
  if (system.toLowerCase().includes("action economy")) return actionEconomyRuntimeComplete();
  return true;
}

async function forceImplementationAfterContradiction(system: string, report: string, evidence: string, rules: string): Promise<ImplementationPatch[]> {
  const prompt = `BLOODLINES IMPLEMENTATION CORRECTION\n${IMPLEMENTATION_ENGINEERING_PROTOCOL}\nThe previous report claimed the system was complete, but the host repository verifier found that claim false. Do NOT return a no-change report. Identify the missing runtime integration and return a concrete patch. Do not invent gameplay mechanics.\n\nSYSTEM: ${system}\nRULES:\n${rules}\nHOST EVIDENCE:\n${evidence}\n\nPREVIOUS REPORT:\n${report}\n\nFor existing files use ONLY this exact JSON format inside the tag: <IMPLEMENTATION_PATCHES>[{"path":"engine/combat/combatLoop.ts","edits":[{"find":"exact existing text","replace":"minimal replacement text"}],"reason":"specific missing runtime integration"}]</IMPLEMENTATION_PATCHES>. Do not use unified diff syntax, Markdown fences, or tool-call markup.`;
  return parsePatchResponse(await askAI(prompt));
}

export async function implementDesign(dataFile: string, enginePath: string, request?: ImplementationRequest): Promise<ImplementationResult> {
  const system = request?.system ?? "Review the supplied implementation against the Rules Bible.";
  const context = (request?.context ?? "Determine implementation status and authorized integration work.").slice(0, MAX_CONTEXT_CHARS);
  const rulesBible = readRulesBible();
  const rules = getRulesSection(rulesBible, system);
  const evidence = collectEvidence(system, dataFile, enginePath, context);
  const prompt = `BLOODLINES IMPLEMENTATION ASSISTANT\n${IMPLEMENTATION_ENGINEERING_PROTOCOL}\nYou are an implementation agent. The host supplies repository evidence; do not emit tool-call markup and do not pretend to inspect files you were not given. Produce the nine required report sections in order. If repository changes are required, append an explicit JSON <IMPLEMENTATION_PATCHES> payload. If you claim the system is already complete, that claim will be independently verified by the host.\n\nRULES:\n${rules}\nSYSTEM: ${system}\nREPOSITORY EVIDENCE:\n${evidence}\n${gitState()}\n\nPATCH CONTRACT: JSON only inside <IMPLEMENTATION_PATCHES>. Existing files use exact find/replace edits. New files use complete content. No unified diffs, Markdown fences, YAML, or <tool_call>.`;

  let output: string;
  try { output = await askAI(prompt); } catch (error) { return { report: `AI request failed: ${errorText(error)}`, patches: [], applied: false }; }

  let report: string;
  try { report = validateImplementationPlan(system, output); }
  catch (error) { return { report: `${output}\n\n# GOVERNANCE VALIDATION\nREJECTED — ${errorText(error)}`, patches: [], applied: false }; }

  let patches: ImplementationPatch[] = [];
  try { patches = parsePatchResponse(output); }
  catch (error) {
    if (!noPatchClaimIsFactuallyValid(system, report)) {
      try { patches = await forceImplementationAfterContradiction(system, report, evidence, rules); }
      catch (correctionError) { return { report: `${report}\n\n# IMPLEMENTATION EXECUTION\nBLOCKED — completion claim contradicted repository evidence; correction failed: ${errorText(correctionError)}`, patches: [], applied: false }; }
    } else {
      return { report: `${report}\n\n# IMPLEMENTATION EXECUTION\nNO PATCH REQUIRED — repository verification agrees that the approved requirements are already implemented.`, patches: [], applied: true };
    }
  }

  if (!patches.length) {
    if (noPatchClaimIsFactuallyValid(system, report)) return { report: `${report}\n\n# IMPLEMENTATION EXECUTION\nNO PATCH REQUIRED — repository verification agrees that the approved requirements are already implemented.`, patches: [], applied: true };
    return { report: `${report}\n\n# IMPLEMENTATION EXECUTION\nBLOCKED — empty patch payload supplied for an incomplete system.`, patches: [], applied: false };
  }

  let changed: string[];
  try { changed = applyPatches(patches); }
  catch (error) { return { report: `${report}\n\n# IMPLEMENTATION EXECUTION\nBLOCKED — ${errorText(error)}`, patches, applied: false }; }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const verification = runVerification();
      return { report: `${report}\n\n# IMPLEMENTATION EXECUTION\nPATCHED: ${changed.join(", ")}\nVERIFICATION PASSED (repair attempts: ${attempt})\n${verification}`, patches, applied: true, verification };
    } catch (error) {
      if (attempt === 2) return { report: `${report}\n\n# IMPLEMENTATION EXECUTION\nPATCHED: ${changed.join(", ")}\nVERIFICATION FAILED\n${errorText(error)}`, patches, applied: true, verification: errorText(error) };
      try {
        const repairPrompt = `BLOODLINES PATCH REPAIR\n${IMPLEMENTATION_ENGINEERING_PROTOCOL}\nRepair only the applied implementation using the actual verification failure below. Preserve existing APIs and do not invent gameplay mechanics. Return JSON only inside <IMPLEMENTATION_PATCHES>.\nSYSTEM: ${system}\nFAILURE:\n${errorText(error).slice(-9000)}\nCURRENT TARGET:\n${evidence}\nFORMAT: <IMPLEMENTATION_PATCHES>[{"path":"relative/path","edits":[{"find":"exact existing text","replace":"minimal replacement text"}],"reason":"specific verification repair"}]</IMPLEMENTATION_PATCHES>`;
        const repair = parsePatchResponse(await askAI(repairPrompt));
        if (!repair.length) break;
        const repairChanged = applyPatches(repair);
        changed = [...new Set([...changed, ...repairChanged])];
        patches = [...patches, ...repair];
      } catch (repairError) {
        return { report: `${report}\n\n# IMPLEMENTATION EXECUTION\nPATCHED: ${changed.join(", ")}\nVERIFICATION FAILED\n${errorText(error)}\nREPAIR FAILED — ${errorText(repairError)}`, patches, applied: true, verification: errorText(error) };
      }
    }
  }
  return { report, patches, applied: true };
}

function errorText(error: unknown): string { return error instanceof Error ? error.message : String(error); }
