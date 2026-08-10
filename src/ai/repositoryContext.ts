import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const IGNORED_DIRECTORIES = new Set([".git", "node_modules", "dist", "build", ".next", "coverage"]);
const ALLOWED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md"]);
const MAX_FILES = 24;
const MAX_LINES_PER_FILE = 120;
const MAX_TOTAL_CHARS = 26000;
const GOVERNANCE_MAX_FILES = 10;
const GOVERNANCE_MAX_LINES_PER_FILE = 45;
const GOVERNANCE_MAX_TOTAL_CHARS = 7000;

function collectFiles(root: string, current = root, files: string[] = []): string[] {
  if (files.length >= 1000) return files;
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;
    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) collectFiles(root, fullPath, files);
    else if (ALLOWED_EXTENSIONS.has(path.extname(entry.name))) files.push(path.relative(root, fullPath));
  }
  return files;
}
function queryTerms(query: string): string[] { return query.toLowerCase().split(/[^a-z0-9_]+/).filter(term => term.length >= 4).slice(0, 40); }
function scoreFile(file: string, terms: string[]): number { const normalized=file.toLowerCase(), basename=path.basename(normalized), stem=basename.replace(/\.[^.]+$/," "); return terms.reduce((score,term)=>score+(stem===term||basename===term?100:stem.includes(term)?30:normalized.includes(`/${term}/`)?20:normalized.includes(term)?8:0),0); }
function findRelevantFiles(root: string, query: string[], limit = MAX_FILES): string[] { const terms=query.flatMap(queryTerms); return collectFiles(root).map(file=>({file,score:scoreFile(file,terms)})).sort((a,b)=>b.score-a.score||a.file.localeCompare(b.file)).slice(0,limit).map(item=>item.file); }
function findExactMatches(root: string, query: string[]): string[] { const terms=query.flatMap(queryTerms); return collectFiles(root).filter(file=>{const basename=path.basename(file).toLowerCase().replace(/\.[^.]+$/,"");return terms.some(term=>basename===term);}); }
function readSafe(root: string, relativePath: string, maxLines = MAX_LINES_PER_FILE): string | null { if(relativePath===".env"||relativePath.includes(".env.")) return null; try{return fs.readFileSync(path.join(root,relativePath),"utf8").split("\n").slice(0,maxLines).join("\n");}catch{return null;} }
function gitSnapshot(root: string): string { try { const head=execFileSync("git",["log","-1","--oneline"],{cwd:root,encoding:"utf8"}).trim(); const status=execFileSync("git",["status","--short"],{cwd:root,encoding:"utf8"}).trim(); return [`Current HEAD: ${head||"unknown"}`,`Working-tree: ${status?status.split("\n").slice(0,12).join(" | "):"clean"}`].join("\n"); } catch { return "Repository history unavailable."; } }
function buildContext(query: string, root: string, maxFiles: number, maxLines: number, maxChars: number): string { const exact=findExactMatches(root,[query]), relevant=findRelevantFiles(root,[query],maxFiles), files=Array.from(new Set([...exact,...relevant])).slice(0,maxFiles); let output=`${gitSnapshot(root)}\n\nRelevant files:\n${files.length?files.map(file=>`- ${file}`).join("\n"):"- None found."}\n\nExact matches:\n${exact.length?exact.map(file=>`- EXISTS: ${file}`).join("\n"):"- None."}\n\nEvidence excerpts:\n`; let chars=output.length; for(const file of files){const content=readSafe(root,file,maxLines);if(!content)continue;const section=`\n--- ${file} ---\n${content}\n`;if(chars+section.length>maxChars)break;output+=section;chars+=section.length;} return output; }

export function buildRepositoryContext(query: string, root = process.cwd()): string { return buildContext(query,root,MAX_FILES,MAX_LINES_PER_FILE,MAX_TOTAL_CHARS); }

/** Compact evidence intended for governance decisions where rules authority and report text already consume most of the prompt budget. */
export function buildGovernanceRepositoryContext(query: string, root = process.cwd()): string { return buildContext(query,root,GOVERNANCE_MAX_FILES,GOVERNANCE_MAX_LINES_PER_FILE,GOVERNANCE_MAX_TOTAL_CHARS); }
