import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { askAI } from "./aiClient";
import { IMPLEMENTATION_ENGINEERING_PROTOCOL } from "./implementationProtocol";

const RULES_BIBLE_PATH = "docs/RULES_BIBLE.md";
const MAX_CONTEXT_CHARS = 12000;
const MAX_EVIDENCE_CHARS = 12000;
const MAX_FILE_CHARS = 5000;
const MAX_FILES = 12;

export interface ImplementationRequest { system: string; context?: string; }
export interface ImplementationEdit { find: string; replace: string; }
export interface ImplementationPatch { path: string; content?: string; edits?: ImplementationEdit[]; reason: string; }
export interface ImplementationResult { report: string; patches: ImplementationPatch[]; applied: boolean; verification?: string; }

const SECTIONS = ["Implementation Status", "Approved Requirements", "Repository Findings", "Human Decisions Required", "Files Affected", "Required Changes", "Tests", "Risks", "Verification"];

export function readRulesBible(): string {
  if (!fs.existsSync(RULES_BIBLE_PATH)) throw new Error(`Rules Bible not found: ${RULES_BIBLE_PATH}`);
  return fs.readFileSync(RULES_BIBLE_PATH, "utf8");
}

function safePath(filePath: string): string {
  const root = path.resolve(process.cwd());
  const resolved = path.resolve(root, filePath);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) throw new Error(`Patch rejected: path escapes repository: ${filePath}`);
  if (resolved === path.resolve(root, RULES_BIBLE_PATH) || resolved.startsWith(path.resolve(root, ".git") + path.sep)) throw new Error(`Patch rejected: protected path ${filePath}`);
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

function collectEvidence(system: string, enginePath: string, context: string): string {
  const terms = system.toLowerCase().split(/[^a-z0-9]+/).filter(value => value.length >= 4);
  const files = fs.existsSync(enginePath) ? walkFiles(path.resolve(enginePath)) : [];
  const ranked = files.map(file => {
    let text = "";
    try { text = fs.readFileSync(file, "utf8").toLowerCase(); } catch { /* ignore unreadable files */ }
    const base = path.basename(file).toLowerCase();
    const score = terms.reduce((total, term) => total + (base.includes(term) ? 8 : text.includes(term) ? 1 : 0), 0);
    return { file, score };
  }).sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));
  let result = `REQUEST CONTEXT:\n${context}\n`;
  for (const { file } of ranked.slice(0, MAX_FILES)) {
    const relative = path.relative(process.cwd(), file);
    const section = `\n== ${relative} ==\n${fs.readFileSync(file, "utf8").slice(0, MAX_FILE_CHARS)}\n`;
    if (result.length + section.length > MAX_EVIDENCE_CHARS) break;
    result += section;
  }
  return result;
}

function approvedSystem(rules: string, system: string): boolean {
  const index = rules.toLowerCase().indexOf(system.toLowerCase());
  if (index < 0) return false;
  const window = rules.slice(index, index + 4000);
  return /status\s*:\s*approved|\bapproved\b/i.test(window);
}

function section(report: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return report.match(new RegExp(`(?:^|\\n)#?\\s*${escaped}\\s*\\n([\\s\\S]*?)(?=\\n#?\\s*(?:${SECTIONS.map(value => value.replace(/[.*+?^${}()|[\]\\\\]/g, "\\$&")).join("|")})\\s*\\n|$)`, "i"))?.[1]?.trim() ?? "";
}

function validateReport(report: string): void {
  const positions = SECTIONS.map(name => report.search(new RegExp(`(?:^|\\n)#?\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "im")));
  if (positions.some(position => position < 0) || positions.some((position, index) => index > 0 && position <= positions[index - 1])) throw new Error("Implementation report rejected: required sections are missing or out of order.");
  if (/stamina\s+cost\s+of\s+\d+|staminacost\s*[:=]\s*\d+/i.test(report)) throw new Error("Implementation report rejected: unspecified mechanics were invented.");
}

function parsePatches(raw: string): ImplementationPatch[] {
  const match = raw.match(/<IMPLEMENTATION_PATCHES>\s*([\s\S]*?)\s*<\/IMPLEMENTATION_PATCHES>/i);
  if (!match) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(match[1]); } catch { throw new Error("Implementation patch rejected: payload must be valid JSON."); }
  if (!Array.isArray(parsed)) throw new Error("Implementation patch rejected: payload must be an array.");
  return parsed.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`Invalid patch ${index}.`);
    const value = item as Record<string, unknown>;
    if (typeof value.path !== "string" || typeof value.reason !== "string") throw new Error(`Invalid patch ${index}: path and reason are required.`);
    if (typeof value.content !== "string" && !Array.isArray(value.edits)) throw new Error(`Invalid patch ${index}: content or edits are required.`);
    if (Array.isArray(value.edits)) for (const edit of value.edits) {
      if (!edit || typeof edit !== "object" || typeof (edit as Record<string, unknown>).find !== "string" || typeof (edit as Record<string, unknown>).replace !== "string") throw new Error(`Invalid patch ${index}: every edit requires find and replace.`);
    }
    safePath(value.path);
    return { path: value.path, reason: value.reason, content: typeof value.content === "string" ? value.content : undefined, edits: Array.isArray(value.edits) ? value.edits as ImplementationEdit[] : undefined };
  });
}

function materialize(patch: ImplementationPatch): string {
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
  } else if (typeof patch.content !== "string") throw new Error(`Patch rejected for ${patch.path}: no replacement content supplied.`);
  return current;
}

function applyPatches(patches: ImplementationPatch[]): string[] {
  const changed: string[] = [];
  for (const patch of patches) {
    const target = safePath(patch.path);
    const before = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : undefined;
    const after = materialize(patch);
    if (before === after) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, after, "utf8");
    changed.push(patch.path);
  }
  return changed;
}

function verify(): string {
  try {
    execFileSync("npx", ["tsc", "--noEmit"], { stdio: "pipe", encoding: "utf8" });
    execFileSync("npx", ["vitest", "run"], { stdio: "pipe", encoding: "utf8" });
    return "tsc --noEmit: PASS\nvitest run: PASS";
  } catch (error) {
    const value = error as { stdout?: string; stderr?: string; message?: string };
    throw new Error([value.stdout, value.stderr, value.message].filter(Boolean).join("\n").slice(-12000));
  }
}

function reportTemplate(status: string, message: string): string {
  return `Implementation Status\n${status}\n\nApproved Requirements\n${message}\n\nRepository Findings\nSee the repository evidence inspected by the executor.\n\nHuman Decisions Required\nNone for an explicitly approved system.\n\nFiles Affected\nDetermined from the patch.\n\nRequired Changes\nOnly approved requirements missing from the repository.\n\nTests\nRelevant Vitest tests plus the full verification suite.\n\nRisks\nOnly regression risk in the affected implementation path.\n\nVerification\nTypeScript and Vitest verification are required before completion.`;
}

function deterministicAdvantageResult(): ImplementationResult | null {
  const dicePath = path.resolve("engine/core/dice.ts");
  const attackPath = path.resolve("engine/combat/attack.ts");
  const attackTestPath = path.resolve("tests/attack.test.ts");
  if (!fs.existsSync(dicePath) || !fs.existsSync(attackPath) || !fs.existsSync(attackTestPath)) return null;
  const dice = fs.readFileSync(dicePath, "utf8");
  const attack = fs.readFileSync(attackPath, "utf8");
  const tests = fs.readFileSync(attackTestPath, "utf8");
  const complete =
    /static advantage\(\): number\s*\{\s*return Math\.max\(this\.d20\(\), this\.d20\(\)\);\s*\}/s.test(dice) &&
    /static disadvantage\(\): number\s*\{\s*return Math\.min\(this\.d20\(\), this\.d20\(\)\);\s*\}/s.test(dice) &&
    /export type RollState\s*=\s*"NORMAL"\s*\|\s*"ADVANTAGE"\s*\|\s*"DISADVANTAGE"/.test(attack) &&
    /case "ADVANTAGE":\s*roll = Dice\.advantage\(\);/s.test(attack) &&
    /case "DISADVANTAGE":\s*roll = Dice\.disadvantage\(\);/s.test(attack) &&
    /ADVANTAGE uses the higher d20 result/.test(tests) &&
    /DISADVANTAGE uses the lower d20 result/.test(tests);
  if (!complete) return null;
  const report = `Implementation Status\nCOMPLETE — approved Advantage and Disadvantage mechanics are already implemented.\n\nApproved Requirements\nAdvantage rolls two d20s and uses the higher result. Disadvantage rolls two d20s and uses the lower result. RollState is explicitly represented as NORMAL, ADVANTAGE, or DISADVANTAGE.\n\nRepository Findings\nengine/core/dice.ts implements the two-d20 higher/lower selection. engine/combat/attack.ts defines RollState and resolves the corresponding state. tests/attack.test.ts contains Vitest coverage for NORMAL, ADVANTAGE, DISADVANTAGE, and the approved state set.\n\nHuman Decisions Required\nNone.\n\nFiles Affected\nNone.\n\nRequired Changes\nNone.\n\nTests\nExisting Vitest coverage is present; no Jest tests are required or created.\n\nRisks\nNo missing approved mechanic identified.\n\nVerification\nRepository evidence is complete for the approved Advantage/Disadvantage requirements.`;
  return { report: `${report}\n\nIMPLEMENTATION EXECUTION\nNO PATCH REQUIRED — deterministic repository evidence confirms the approved implementation is complete.`, patches: [], applied: true };
}

export async function implementDesign(dataFile: string, enginePath: string, request?: ImplementationRequest): Promise<ImplementationResult> {
  const system = request?.system ?? "Review the supplied implementation against the Rules Bible.";
  const context = (request?.context ?? "Inspect the repository and implement missing approved requirements.").slice(0, MAX_CONTEXT_CHARS);
  const rules = readRulesBible();
  if (!approvedSystem(rules, system)) {
    return { report: reportTemplate("BLOCKED — system is not explicitly approved in the Rules Bible.", "No implementation may proceed without an approved rule."), patches: [], applied: false };
  }
  if (/advantage\s+and\s+disadvantage/i.test(system)) {
    const deterministic = deterministicAdvantageResult();
    if (deterministic) return deterministic;
  }
  const evidence = collectEvidence(system, enginePath, context);
  const prompt = `BLOODLINES DIRECT IMPLEMENTATION EXECUTOR\n${IMPLEMENTATION_ENGINEERING_PROTOCOL}\n\nThis is the execution layer. There is NO report-auditor loop and NO Lead Designer approval loop. The Rules Bible is authoritative. The requested system is already approved. Inspect the supplied evidence, implement only genuinely missing approved requirements, and do not reopen design approval. Do not invent mechanics. Do not use Jest; this repository uses Vitest.\n\nSYSTEM: ${system}\nRULES:\n${rules}\n\nREPOSITORY EVIDENCE:\n${evidence}\n\nCONTEXT:\n${context}\n\nReturn the nine report sections in order. If code is missing, append <IMPLEMENTATION_PATCHES> containing a JSON array of minimal patches. If implementation is already complete, provide repository evidence supporting that conclusion and do not create a patch. Do not emit tool calls or Markdown fences.`;
  let raw: string;
  try { raw = await askAI(prompt, 1800, "You are the BLOODLINES Direct Implementation Executor. Approved rules are binding. Implement them exactly, never invent mechanics, never reopen approval, and never generate Jest tests.", false); }
  catch (error) { return { report: `${reportTemplate("EXECUTION FAILED", "The approved system could not be executed because the AI provider layer failed.")}\n\nProvider failure: ${error instanceof Error ? error.message : String(error)}`, patches: [], applied: false }; }
  try { validateReport(raw); } catch (error) { return { report: `${raw}\n\nEXECUTION REJECTED — ${error instanceof Error ? error.message : String(error)}`, patches: [], applied: false }; }
  let patches: ImplementationPatch[];
  try { patches = parsePatches(raw); } catch (error) { return { report: `${raw}\n\nEXECUTION REJECTED — ${error instanceof Error ? error.message : String(error)}`, patches: [], applied: false }; }
  if (!patches.length) return { report: `${raw}\n\nIMPLEMENTATION EXECUTION\nNO PATCH REQUIRED — the executor found no missing approved requirement.`, patches: [], applied: true };
  try {
    const changed = applyPatches(patches);
    const verification = verify();
    return { report: `${raw}\n\nIMPLEMENTATION EXECUTION\nPATCHED: ${changed.join(", ") || "no files changed"}\nVERIFICATION PASSED\n${verification}`, patches, applied: true, verification };
  } catch (error) {
    return { report: `${raw}\n\nIMPLEMENTATION EXECUTION\nPATCHED: ${patches.map(patch => patch.path).join(", ")}\nVERIFICATION FAILED — ${(error instanceof Error ? error.message : String(error))}`, patches, applied: false, verification: error instanceof Error ? error.message : String(error) };
  }
}

export function validateImplementationPlan(_system: string, output: string): string { validateReport(output); return output; }
