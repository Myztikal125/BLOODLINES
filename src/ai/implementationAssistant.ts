import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { askAI } from "./aiClient";
import { IMPLEMENTATION_ENGINEERING_PROTOCOL } from "./implementationProtocol";

const RULES_BIBLE_PATH = "docs/RULES_BIBLE.md";
const MAX_REPOSITORY_EVIDENCE_CHARS = 3200;
const MAX_FILE_CHARS = 900;
const MAX_IMPLEMENTATION_FILE_CHARS = 9000;
const MAX_FILES = 6;
const MAX_RULES_SECTION_CHARS = 3200;
const MAX_CONTEXT_CHARS = 900;
const MAX_REPAIR_FILES = 8;
const MAX_REPAIR_FILE_CHARS = 9000;

export interface ImplementationRequest { system: string; context?: string; }
export interface ImplementationEdit { find: string; replace: string; }
export interface ImplementationPatch { path: string; content?: string; edits?: ImplementationEdit[]; reason: string; }
export interface ImplementationResult { report: string; patches: ImplementationPatch[]; applied: boolean; verification?: string; }

export function readRulesBible(): string {
  if (!fs.existsSync(RULES_BIBLE_PATH)) throw new Error(`Rules Bible not found: ${RULES_BIBLE_PATH}`);
  return fs.readFileSync(RULES_BIBLE_PATH, "utf8");
}

function getTargetKeywords(system: string): string[] {
  const s = system.toLowerCase();
  if (s.includes("action economy")) return ["action","turn","bonus","reaction","stamina","energy","combat","resolver","loop"];
  if (s.includes("advantage") || s.includes("disadvantage")) return ["advantage","disadvantage","roll","dice","d20","rules","runtime"];
  return s.split(/[^a-z0-9]+/).filter(w => w.length >= 4);
}

function extractExplicitPaths(text: string): string[] {
  const matches = text.match(/(?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+\.(?:ts|tsx|js|json|md)/g) ?? [];
  return [...new Set(matches)].filter(file => { try { safePath(file); return true; } catch { return false; } });
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

function collectRelevantEngineFiles(system: string, context: string, enginePath: string): string[] {
  const explicit = extractExplicitPaths(`${system}\n${context}`);
  const keywords = getTargetKeywords(system);
  const files: string[] = [];
  if (!fs.existsSync(enginePath) || !fs.statSync(enginePath).isDirectory()) return explicit;
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (["node_modules",".git","dist","coverage"].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|js)$/.test(entry.name)) files.push(full);
    }
  };
  walk(enginePath);
  const ranked = files.map(file => {
    const text = fs.readFileSync(file, "utf8").toLowerCase();
    const base = path.basename(file).toLowerCase();
    let score = keywords.reduce((sum, key) => sum + (base.includes(key) ? 8 : text.includes(key) ? 1 : 0), 0);
    if (text.includes("actioneconomystate") || text.includes("action economy")) score += 10;
    return { file, score };
  }).filter(x => x.score > 0).sort((a,b) => b.score-a.score || a.file.localeCompare(b.file));
  return [...new Set([...explicit, ...ranked.slice(0, MAX_FILES).map(x => x.file)])];
}

function readImplementationEvidence(system: string, context: string, dataFile: string, enginePath: string): string {
  const candidates = new Set<string>([...extractExplicitPaths(`${system}\n${context}`), ...collectRelevantEngineFiles(system, context, enginePath)]);
  for (const candidate of [dataFile]) {
    try { if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) candidates.add(candidate); } catch {}
  }
  let out = "";
  for (const file of [...candidates].slice(0, MAX_FILES)) {
    try {
      const content = fs.readFileSync(safePath(file), "utf8");
      out += `\n== COMPLETE TARGET FILE: ${file} ==\n${content.slice(0,MAX_IMPLEMENTATION_FILE_CHARS)}\n`;
      const history = execFileSync("git", ["log", "-n", "3", "--format=%h %s", "--", file], { encoding: "utf8" }).trim();
      if (history) out += `== GIT HISTORY: ${file} ==\n${history}\n`;
    } catch {}
  }
  return out || "[No explicit implementation targets were identified from the request.]";
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
  const common = `RULES GUARD:\n- Rules Bible is the gameplay authority.\n- Implement every approved requirement; never silently omit one.\n- Never invent gameplay values, costs, triggers, timing, defaults, regeneration, scaling, or balancing.\n- Suggestions are allowed but must be labeled suggestions.\n- Accepted implementation means actual repository files are patched.\n- Preserve every existing public export, class, function, constructor, and API unless a breaking change is explicitly approved.\n- Inspect complete current target files before changing them.\n- Inspect Git history when repairing a regression.\n- Extend existing code; never replace a populated file with a small snippet.\n- For existing files, prefer exact text edits over whole-file replacements.\n- After patching, typecheck and test. If the patch causes failures, repair only that patch.\n- Do not commit or push.`;
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
    if (typeof p.path!=="string"||typeof p.reason!=="string") throw new Error(`Invalid patch ${i}: path/reason required.`);
    if (typeof p.content !== "string" && !Array.isArray(p.edits)) throw new Error(`Invalid patch ${i}: provide content for a new file or edits for an existing file.`);
    if (Array.isArray(p.edits)) for (const edit of p.edits) if (!edit || typeof edit !== "object" || typeof (edit as Record<string,unknown>).find !== "string" || typeof (edit as Record<string,unknown>).replace !== "string") throw new Error(`Invalid patch ${i}: every edit requires find/replace strings.`);
    safePath(p.path); return {path:p.path,content:typeof p.content === "string" ? p.content : undefined,edits:Array.isArray(p.edits) ? p.edits as ImplementationEdit[] : undefined,reason:p.reason};
  });
}

function materializePatch(patch: ImplementationPatch): string {
  const target=safePath(patch.path);
  if (!fs.existsSync(target)) { if (typeof patch.content !== "string") throw new Error(`Patch rejected for ${patch.path}: new files require complete content.`); return patch.content; }
  let current=fs.readFileSync(target,"utf8");
  if (patch.edits?.length) for (const edit of patch.edits) { const occurrences=current.split(edit.find).length-1; if (occurrences !== 1) throw new Error(`Patch rejected for ${patch.path}: expected exactly one match for an edit, found ${occurrences}.`); current=current.replace(edit.find,edit.replace); }
  else if (typeof patch.content !== "string") throw new Error(`Patch rejected for ${patch.path}: no content or edits supplied.`);
  return current;
}

function validateApiPreservation(patches: ImplementationPatch[]): void {
  for (const patch of patches) {
    const target=safePath(patch.path); if (!fs.existsSync(target)) continue;
    const current=fs.readFileSync(target,"utf8"); const result=materializePatch(patch);
    const exportedSymbols = [...current.matchAll(/export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g)].map(m=>m[1]);
    for (const symbol of exportedSymbols) if (!new RegExp(`export\\s+(?:default\\s+)?(?:class|function|const|let|var|interface|type|enum)\\s+${symbol}\\b`).test(result)) throw new Error(`Patch rejected for ${patch.path}: existing exported symbol ${symbol} would be removed.`);
  }
}

function applyPatches(patches: ImplementationPatch[]): string[] {
  validateApiPreservation(patches); const changed:string[]=[];
  for (const patch of patches) { const target=safePath(patch.path); const existed=fs.existsSync(target); const next=materializePatch(patch); if (existed) { const current=fs.readFileSync(target,"utf8"); if (current===next) continue; if (!patch.edits?.length && next.length < Math.max(200,Math.floor(current.length*0.5))) throw new Error(`Patch rejected for ${patch.path}: suspiciously smaller replacement; use minimal edits and preserve existing APIs.`); } fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,next,"utf8"); changed.push(patch.path); }
  return changed;
}

function runCommand(command:string,args:string[]):string { return execFileSync(command,args,{encoding:"utf8",stdio:["ignore","pipe","pipe"]}).trim() || "PASS"; }
function runVerification():string { try { const typecheck=runCommand("npx",["tsc","--noEmit"]); const tests=runCommand("npx",["vitest","run"]); return `tsc --noEmit: ${typecheck}\nvitest run: ${tests}`; } catch (error) { const message=error as {message?:string;stdout?:string;stderr?:string}; throw new Error([message.message??String(error),message.stdout??"",message.stderr??""].filter(Boolean).join("\n").slice(-12000)); } }

function extractErrorPaths(error:string):string[] { const paths=new Set<string>(); const re=/(?:^|\n)([^\s:]+\.(?:ts|tsx|js|json)):\d+:\d+/g; let match:RegExpExecArray|null; while((match=re.exec(error))) { try{safePath(match[1]);paths.add(match[1]);}catch{} } return [...paths].slice(0,MAX_REPAIR_FILES); }
function collectRepairFiles(patches:ImplementationPatch[],error:string):string { const paths=new Set<string>(patches.map(p=>p.path)); for(const p of extractErrorPaths(error)) paths.add(p); let output=""; for(const file of [...paths].slice(0,MAX_REPAIR_FILES)) try{output+=`\n== ${file} ==\n${fs.readFileSync(safePath(file),"utf8").slice(0,MAX_REPAIR_FILE_CHARS)}\n`;}catch{} return output||"[No affected files could be read.]"; }
async function repairFailedImplementation(system:string,rules:string,patches:ImplementationPatch[],error:string):Promise<ImplementationPatch[]> { const files=collectRepairFiles(patches,error); const prompt=`BLOODLINES REPAIR ONLY\n${IMPLEMENTATION_ENGINEERING_PROTOCOL}\nSystem: ${system}\nRules summary: ${rules.slice(0,1200)}\nACTUAL VERIFICATION FAILURE:\n${error.slice(-7000)}\nAFFECTED CURRENT FILES:\n${files.slice(0,30000)}\n\nRepair the previous patch only. Diagnose the actual compiler/test failure. Preserve ALL existing exports/classes/functions/public APIs. Prefer exact edits for existing files using this format; do not return whole-file replacements unless necessary: <IMPLEMENTATION_PATCHES>[{"path":"relative/path","edits":[{"find":"exact existing text","replace":"minimal replacement text"}],"reason":"specific repair diagnosis"}]</IMPLEMENTATION_PATCHES>. New files may use complete content. Restore real implementations if an earlier patch removed one. Do not invent gameplay mechanics.`; return parsePatchResponse(await askAI(prompt)); }

function reportDeclaresNoChangeNeeded(report:string):boolean { const status=report.match(/# Implementation Status\s+([\s\S]*?)(?=\n# Approved Requirements)/i)?.[1]??""; const changes=report.match(/# Required Changes\s+([\s\S]*?)(?=\n# Tests)/i)?.[1]??""; return /(already|fully|completely)\s+(implemented|complete|satisfied)/i.test(status) && /(?:none|no\s+(?:code|repository)\s+changes?\s+(?:are\s+)?required|no\s+changes?\s+required)/i.test(changes); }

export async function implementDesign(dataFile:string,enginePath:string,request?:ImplementationRequest):Promise<ImplementationResult> {
  const system=request?.system??"Review the supplied implementation against the Rules Bible."; const rulesBible=readRulesBible(); const data=readRepositoryEvidence(dataFile,system); const engine=readRepositoryEvidence(enginePath,system); const context=(request?.context??"Determine implementation status and authorized integration work.").slice(0,MAX_CONTEXT_CHARS); const implementationEvidence=readImplementationEvidence(system,context,dataFile,enginePath); const rules=getRulesSection(rulesBible,system);
  const prompt=`BLOODLINES IMPLEMENTATION ASSISTANT\n${IMPLEMENTATION_ENGINEERING_PROTOCOL}\nYou are an implementation agent. Inspect the actual repository evidence and Rules Bible. Produce the required report, then if an approved repository change is required return an explicit patch payload. If the approved requirements are already implemented, do not invent a patch; state that clearly in Implementation Status and Required Changes. The host will apply any authorized patch and verify it.\n\n${rules}\nSYSTEM: ${system}\nCONTEXT: ${context}\nREPOSITORY EVIDENCE:\n${data}\nENGINE EVIDENCE:\n${engine}\nTARGET IMPLEMENTATION EVIDENCE:\n${implementationEvidence.slice(0,42000)}\n${gitState()}\n${getGuard(system)}\n\nReturn exactly these report headings first:\n${REQUIRED_SECTIONS.join("\n")}\n\nPATCH FORMAT:\n- Only when a repository change is required, append <IMPLEMENTATION_PATCHES> after the nine report sections.\n- Existing files: minimal exact-text edits.\n- New files: complete content.`;
  const output=await askAI(prompt); let report:string; try{report=validateImplementationPlan(system,output);}catch(e){return{report:`${output}\n\n# GOVERNANCE VALIDATION\nREJECTED — DO NOT IMPLEMENT\n${errorText(e)}`,patches:[],applied:false};}
  let patches:ImplementationPatch[]=[]; try{patches=parsePatchResponse(output);}catch(e){if(reportDeclaresNoChangeNeeded(report)) return {report:`${report}\n\n# IMPLEMENTATION EXECUTION\nNO PATCH REQUIRED — repository evidence indicates the approved requirements are already implemented.`,patches:[],applied:true}; return {report:`${report}\n\n# IMPLEMENTATION EXECUTION\nBLOCKED — ${errorText(e)}`,patches:[],applied:false};}
  if(!patches.length){if(reportDeclaresNoChangeNeeded(report)) return {report:`${report}\n\n# IMPLEMENTATION EXECUTION\nNO PATCH REQUIRED — repository evidence indicates the approved requirements are already implemented.`,patches:[],applied:true}; return {report:`${report}\n\n# IMPLEMENTATION EXECUTION\nBLOCKED — Empty patch payload supplied for a report that requires repository changes.`,patches:[],applied:false};}
  let changed:string[]; try{changed=applyPatches(patches);}catch(e){return{report:`${report}\n\n# IMPLEMENTATION EXECUTION\nBLOCKED — ${errorText(e)}`,patches,applied:false};}
  let lastError=""; for(let attempt=0;attempt<3;attempt++){try{const verification=runVerification();return{report:`${report}\n\n# IMPLEMENTATION EXECUTION\nPATCHED: ${changed.join(", ")}\nVERIFICATION PASSED (repair attempts: ${attempt})\n${verification}`,patches,applied:true,verification};}catch(e){lastError=errorText(e);if(attempt===2)break;try{const repair=await repairFailedImplementation(system,rules,patches,lastError);if(!repair.length)break;const repairChanged=applyPatches(repair);changed=[...new Set([...changed,...repairChanged])];patches=[...patches,...repair];}catch(repairError){lastError=`${lastError}\nSELF-REPAIR ERROR: ${errorText(repairError)}`;break;}}}
  return{report:`${report}\n\n# IMPLEMENTATION EXECUTION\nPATCHED: ${changed.join(", ")}\nVERIFICATION FAILED\n${lastError}`,patches,applied:true,verification:lastError};
}
function errorText(error:unknown):string{return error instanceof Error?error.message:String(error);}
