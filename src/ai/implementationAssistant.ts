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
  const s = system.toLowerCase();
  if (s.includes("action economy")) return ["action","turn","bonus","reaction","stamina","energy","combat","resolver"];
  if (s.includes("advantage") || s.includes("disadvantage")) return ["advantage","disadvantage","roll","dice","d20","rules","runtime"];
  return s.split(/[^a-z0-9]+/).filter(w => w.length >= 4);
}

function readRepositoryEvidence(inputPath: string, system: string): string {
  if (!fs.existsSync(inputPath)) throw new Error(`Repository evidence path not found: ${inputPath}`);
  if (fs.statSync(inputPath).isFile()) return fs.readFileSync(inputPath, "utf8").slice(0, MAX_FILE_CHARS);
  const files: string[] = [];
  const keywords = getTargetKeywords(system);
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (["node_modules",".git","dist","coverage"].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|js|json|md)$/.test(entry.name)) files.push(full);
    }
  };
  walk(inputPath);
  const ranked = files.map(file => {
    const base = path.basename(file).toLowerCase();
    let score = 0;
    for (const key of keywords) score += base.includes(key) ? 6 : file.toLowerCase().includes(key) ? 2 : 0;
    return { file, score };
  }).filter(x => x.score > 0).sort((a,b) => b.score-a.score || a.file.localeCompare(b.file)).slice(0, MAX_FILES);
  let out = "";
  for (const item of ranked) {
    try {
      const section = `\n== ${item.file} ==\n${fs.readFileSync(item.file,"utf8").slice(0,MAX_FILE_CHARS)}\n`;
      if (out.length + section.length <= MAX_REPOSITORY_EVIDENCE_CHARS) out += section;
    } catch {}
  }
  return out || "[No targeted repository evidence.]";
}

function getRulesSection(rulesBible: string, system: string): string {
  const lines = rulesBible.split("\n");
  const start = lines.findIndex(line => line.toLowerCase().includes(system.toLowerCase()));
  if (start < 0) return rulesBible.slice(0, MAX_RULES_SECTION_CHARS);
  let end = lines.length;
  for (let i=start+1;i<lines.length;i++) if (/^#{2,3}\s/.test(lines[i])) { end=i; break; }
  return lines.slice(Math.max(0,start-1),end).join("\n").slice(0,MAX_RULES_SECTION_CHARS);
}

function gitState(): string {
  try {
    const head=execFileSync("git",["rev-parse","--short","HEAD"],{encoding:"utf8"}).trim();
    const status=execFileSync("git",["status","--short"],{encoding:"utf8"}).trim();
    return `Repository HEAD: ${head}\nWorking tree: ${status || "clean"}`;
  } catch { return "Repository Git state unavailable."; }
}

function getGuard(system: string): string {
  const common = `RULES GUARD:\n- Rules Bible is the gameplay authority.\n- Implement every approved requirement; never silently omit one.\n- Never invent gameplay values, costs, triggers, timing, defaults, regeneration, scaling, or balancing.\n- Suggestions are allowed but must be labeled suggestions.\n- Accepted implementation means actual repository files are patched.\n- Preserve every existing public export, class, function, constructor, and API unless a breaking change is explicitly approved.\n- Inspect complete current target files before changing them. Extend existing code; never replace a populated file with a small snippet.\n- After patching, typecheck and test. If the patch causes failures, repair only that patch.\n- Do not commit or push.`;
  return system.toLowerCase().includes("action economy") ? `${common}\nACTION ECONOMY: account for Action, Bonus Action, Reaction, consumption/reset, turn reset, stamina resource, and no-extra-slot requirements. Do not invent stamina costs/max/regeneration or reaction/bonus triggers.` : common;
}

const REQUIRED_SECTIONS = ["# Implementation Status","# Approved Requirements","# Repository Findings","# Human Decisions Required","# Files Affected","# Required Changes","# Tests","# Risks","# Verification"];

export function validateImplementationPlan(system: string, output: string): string {
  if (!REQUIRED_SECTIONS.every(s => output.includes(s))) throw new Error("Implementation plan rejected: required report sections were omitted.");
  if (/stamina\s+cost\s+of\s+\d+|staminacost\s*[:=]\s*\d+/i.test(output)) throw new Error("Implementation plan rejected: unspecified mechanics were invented.");
  if (system.toLowerCase().includes("action economy")) {
    const required: [string,RegExp][] = [["action",/one\s+action|baseline.*one.*turn/i],["bonus action",/bonus\s+action/i],["reaction",/reaction/i],["action consumption",/action.*consum|consum.*action/i],["bonus consumption",/bonus.*consum|consum.*bonus/i],["reaction reset",/reaction.*reset|reset.*reaction/i],["turn reset",/turn.*reset|reset.*turn/i],["stamina resource",/stamina|energy/i],["no extra baseline slots",/stamina.*(extra|additional).*action|cannot.*purchase.*extra.*action|cannot.*gain.*extra.*action/i]];
    const missing=required.filter(([,r])=>!r.test(output)).map(([n])=>n);
    if (missing.length) throw new Error(`Implementation plan rejected: approved requirements were omitted: ${missing.join(", ")}`);
  }
  return output;
}

function safePath(filePath: string): string {
  const root=path.resolve(process.cwd()); const resolved=path.resolve(root,filePath);
  if (resolved!==root && !resolved.startsWith(root+path.sep)) throw new Error(`Patch rejected: path escapes repository: ${filePath}`);
  if (resolved===path.resolve(root,RULES_BIBLE_PATH) || resolved.startsWith(path.resolve(root,".git")+path.sep)) throw new Error(`Patch rejected: protected path ${filePath}`);
  return resolved;
}

function parsePatchResponse(raw: string): ImplementationPatch[] {
  const match=raw.match(/<IMPLEMENTATION_PATCHES>\s*([\s\S]*?)\s*<\/IMPLEMENTATION_PATCHES>/i);
  if (!match) throw new Error("Implementation patch rejected: no explicit patch payload.");
  let parsed: unknown; try { parsed=JSON.parse(match[1]); } catch { throw new Error("Implementation patch rejected: invalid JSON patch payload."); }
  if (!Array.isArray(parsed)) throw new Error("Implementation patch rejected: patch payload must be an array.");
  return parsed.map((item,i)=>{
    if (!item || typeof item!=="object") throw new Error(`Invalid patch ${i}`);
    const p=item as Record<string,unknown>;
    if (typeof p.path!=="string"||typeof p.content!=="string"||typeof p.reason!=="string") throw new Error(`Invalid patch ${i}: path/content/reason required.`);
    safePath(p.path); return {path:p.path,content:p.content,reason:p.reason};
  });
}

function applyPatches(patches: ImplementationPatch[]): string[] {
  const changed:string[]=[];
  for (const patch of patches) {
    const target=safePath(patch.path); const existed=fs.existsSync(target);
    if (existed) {
      const current=fs.readFileSync(target,"utf8");
      if (current===patch.content) continue;
      if (patch.content.length < Math.max(200,Math.floor(current.length*0.5))) throw new Error(`Patch rejected for ${patch.path}: suspiciously smaller replacement; preserve existing APIs.`);
    }
    fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,patch.content,"utf8"); changed.push(patch.path);
  }
  return changed;
}

function runCommand(command:string,args:string[]):string { return execFileSync(command,args,{encoding:"utf8",stdio:["ignore","pipe","pipe"]}).trim() || "PASS"; }
function runVerification():string { return `tsc --noEmit: ${runCommand("npx",["tsc","--noEmit"])}\nvitest run: ${runCommand("npx",["vitest","run"])}`; }
function errorText(error:unknown):string { return error instanceof Error ? error.message : String(error); }

async function repairFailedImplementation(system:string, rules:string, patches:ImplementationPatch[], error:string):Promise<ImplementationPatch[]> {
  const files=patches.map(p=>`== ${p.path} ==\n${fs.existsSync(p.path)?fs.readFileSync(p.path,"utf8"):p.content}`).join("\n");
  const prompt=`BLOODLINES REPAIR ONLY\nSystem: ${system}\nRules summary: ${rules.slice(0,1200)}\nACTUAL VERIFICATION FAILURE:\n${error.slice(0,5000)}\nAFFECTED CURRENT FILES:\n${files.slice(0,10000)}\n\nRepair the previous patch only. Diagnose the actual error. Preserve ALL existing exports/classes/functions/public APIs. Do not replace populated files with snippets. Restore anything removed accidentally. Do not invent gameplay mechanics. Return only complete contents of files that must change:\n<IMPLEMENTATION_PATCHES>[{"path":"relative/path","content":"complete file","reason":"specific repair diagnosis"}]</IMPLEMENTATION_PATCHES>`;
  return parsePatchResponse(await askAI(prompt));
}

export async function implementDesign(dataFile:string, enginePath:string, request?:ImplementationRequest):Promise<ImplementationResult> {
  const system=request?.system ?? "Review the supplied implementation against the Rules Bible.";
  const rulesBible=readRulesBible(); const data=readRepositoryEvidence(dataFile,system); const engine=readRepositoryEvidence(enginePath,system); const rules=getRulesSection(rulesBible,system); const context=(request?.context??"Determine implementation status and authorized integration work.").slice(0,MAX_CONTEXT_CHARS);
  const prompt=`BLOODLINES IMPLEMENTATION ASSISTANT\nYou are an implementation agent. Inspect the actual repository and Rules Bible. Produce the required report, then if governance accepts the plan return an explicit patch payload. The host will apply it and verify it.\n\n${rules}\nSYSTEM: ${system}\nCONTEXT: ${context}\nREPOSITORY EVIDENCE:\n${data}\nENGINE EVIDENCE:\n${engine}\n${gitState()}\n${getGuard(system)}\n\nReturn exactly these report headings first:\n${REQUIRED_SECTIONS.join("\n")}\n\nThen, if implementation is authorized:\n<IMPLEMENTATION_PATCHES>\n[{"path":"relative/path","content":"complete file contents","reason":"why authorized"}]\n</IMPLEMENTATION_PATCHES>`;
  const output=await askAI(prompt);
  let report:string; try { report=validateImplementationPlan(system,output); } catch(e) { return {report:`${output}\n\n# GOVERNANCE VALIDATION\nREJECTED — DO NOT IMPLEMENT\n${errorText(e)}`,patches:[],applied:false}; }
  let patches:ImplementationPatch[]; try { patches=parsePatchResponse(output); } catch(e) { return {report:`${report}\n\n# IMPLEMENTATION EXECUTION\nBLOCKED — ${errorText(e)}`,patches:[],applied:false}; }
  if (!patches.length) return {report:`${report}\n\n# IMPLEMENTATION EXECUTION\nBLOCKED — No explicit implementation patch was supplied.`,patches:[],applied:false};
  let changed=applyPatches(patches); let lastError="";
  for(let attempt=0;attempt<3;attempt++) {
    try { const verification=runVerification(); return {report:`${report}\n\n# IMPLEMENTATION EXECUTION\nPATCHED: ${changed.join(", ")}\nVERIFICATION PASSED (repair attempts: ${attempt})\n${verification}`,patches,applied:true,verification}; }
    catch(e) {
      lastError=errorText(e);
      if(attempt===2) break;
      try { const repair=await repairFailedImplementation(system,rules,patches,lastError); if(!repair.length) break; const repairChanged=applyPatches(repair); changed=[...new Set([...changed,...repairChanged])]; patches=repair; }
      catch(repairError) { lastError=`${lastError}\nSELF-REPAIR ERROR: ${errorText(repairError)}`; break; }
    }
  }
  return {report:`${report}\n\n# IMPLEMENTATION EXECUTION\nPATCHED: ${changed.join(", ")}\nVERIFICATION FAILED\n${lastError}`,patches,applied:true,verification:lastError};
}
