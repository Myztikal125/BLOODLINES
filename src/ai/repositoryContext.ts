import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const IGNORED_DIRECTORIES = new Set([".git", "node_modules", "dist", "build", ".next", "coverage"]);
const ALLOWED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md"]);
const MAX_FILES = 24;
const MAX_LINES_PER_FILE = 120;
const MAX_TOTAL_CHARS = 26000;
const GOVERNANCE_MAX_FILES = 10;
const GOVERNANCE_MAX_LINES_PER_FILE = 60;
const GOVERNANCE_MAX_TOTAL_CHARS = 9000;

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
function scoreFile(root: string, file: string, terms: string[]): number {
  const normalized = file.toLowerCase();
  const basename = path.basename(normalized);
  const stem = basename.replace(/\.[^.]+$/, "");
  let score = terms.reduce((total, term) => total + (stem === term || basename === term ? 100 : stem.includes(term) ? 30 : normalized.includes(`/${term}/`) ? 20 : normalized.includes(term) ? 8 : 0), 0);
  try {
    const content = fs.readFileSync(path.join(root, file), "utf8").toLowerCase();
    for (const term of terms) {
      const matches = content.match(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "g"));
      if (matches) score += Math.min(matches.length * 12, 120);
    }
  } catch {
    // Filename/path evidence is still usable when a file cannot be read.
  }
  return score;
}
function contentMatches(root: string, file: string, terms: string[]): string[] {
  try {
    const content = fs.readFileSync(path.join(root, file), "utf8").toLowerCase();
    return terms.filter(term => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`).test(content));
  } catch {
    return [];
  }
}
function findRelevantFiles(root: string, query: string[], limit = MAX_FILES): string[] { const terms=query.flatMap(queryTerms); return collectFiles(root).map(file=>({file,score:scoreFile(root,file,terms)})).sort((a,b)=>b.score-a.score||a.file.localeCompare(b.file)).slice(0,limit).map(item=>item.file); }
function findExactMatches(root: string, query: string[]): string[] { const terms=query.flatMap(queryTerms); return collectFiles(root).filter(file=>{const basename=path.basename(file).toLowerCase().replace(/\.[^.]+$/,"");return terms.some(term=>basename===term);}); }
function readSafe(root: string, relativePath: string, maxLines = MAX_LINES_PER_FILE): string | null { if(relativePath===".env"||relativePath.includes(".env.")) return null; try{return fs.readFileSync(path.join(root,relativePath),"utf8").split("\n").slice(0,maxLines).join("\n");}catch{return null;} }
function gitSnapshot(root: string): string { try { const head=execFileSync("git",["log","-1","--oneline"],{cwd:root,encoding:"utf8"}).trim(); const status=execFileSync("git",["status","--short"],{cwd:root,encoding:"utf8"}).trim(); return [`Current HEAD: ${head||"unknown"}`,`Working-tree: ${status?status.split("\n").slice(0,12).join(" | "):"clean"}`].join("\n"); } catch { return "Repository history unavailable."; } }
function buildContext(query: string, root: string, maxFiles: number, maxLines: number, maxChars: number): string {
  const terms=queryTerms(query);
  const exact=findExactMatches(root,[query]), relevant=findRelevantFiles(root,[query],maxFiles), files=Array.from(new Set([...exact,...relevant])).slice(0,maxFiles);
  let output=`${gitSnapshot(root)}\n\nRepository evidence rules:\n- Content matches are evidence of implementation location regardless of directory name.\n- Do not assume a mechanic belongs under engine/rules/.\n- Inspect the listed content matches before declaring a system unimplemented.\n\nRelevant files:\n${files.length?files.map(file=>`- ${file}`).join("\n"):"- None found."}\n\nContent matches:\n${files.map(file=>{const matches=contentMatches(root,file,terms);return matches.length?`- ${file}: ${matches.join(", ")}`:null;}).filter(Boolean).join("\n")||"- None."}\n\nExact filename matches:\n${exact.length?exact.map(file=>`- EXISTS: ${file}`).join("\n"):"- None."}\n\nEvidence excerpts:\n`;
  let chars=output.length;
  for(const file of files){const content=readSafe(root,file,maxLines);if(!content)continue;const section=`\n--- ${file} ---\n${content}\n`;if(chars+section.length>maxChars)break;output+=section;chars+=section.length;}
  return output;
}

export function buildRepositoryContext(query: string, root = process.cwd()): string { return buildContext(query,root,MAX_FILES,MAX_LINES_PER_FILE,MAX_TOTAL_CHARS); }

/** Compact evidence intended for governance decisions where rules authority and report text already consume most of the prompt budget. */
export function buildGovernanceRepositoryContext(query: string, root = process.cwd()): string { return buildContext(query,root,GOVERNANCE_MAX_FILES,GOVERNANCE_MAX_LINES_PER_FILE,GOVERNANCE_MAX_TOTAL_CHARS); }
