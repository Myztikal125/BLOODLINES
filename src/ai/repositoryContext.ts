import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage"
]);

const ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md"
]);

const MAX_FILES = 24;
const MAX_LINES_PER_FILE = 120;
const MAX_TOTAL_CHARS = 26000;

function collectFiles(root: string, current = root, files: string[] = []): string[] {
  if (files.length >= 1000) return files;

  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;

    const fullPath = path.join(current, entry.name);

    if (entry.isDirectory()) {
      collectFiles(root, fullPath, files);
      continue;
    }

    if (ALLOWED_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(path.relative(root, fullPath));
    }
  }

  return files;
}

function queryTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((term) => term.length >= 4)
    .slice(0, 40);
}

function scoreFile(file: string, terms: string[]): number {
  const normalized = file.toLowerCase();
  const basename = path.basename(normalized);
  const stem = basename.replace(/\.[^.]+$/, "");

  return terms.reduce((score, term) => {
    if (stem === term || basename === term) return score + 100;
    if (stem.includes(term)) return score + 30;
    if (normalized.includes(`/${term}/`)) return score + 20;
    return score + (normalized.includes(term) ? 8 : 0);
  }, 0);
}

function findRelevantFiles(root: string, query: string): string[] {
  const terms = queryTerms(query);
  const files = collectFiles(root);

  const scored = files
    .map((file) => ({ file, score: scoreFile(file, terms) }))
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));

  return scored.slice(0, MAX_FILES).map(({ file }) => file);
}

function findExactMatches(root: string, query: string): string[] {
  const terms = queryTerms(query);
  const files = collectFiles(root);

  return files.filter((file) => {
    const basename = path.basename(file).toLowerCase().replace(/\.[^.]+$/, "");
    return terms.some((term) => basename === term);
  });
}

function readSafe(root: string, relativePath: string): string | null {
  if (relativePath === ".env" || relativePath.includes(".env.")) return null;

  try {
    const content = fs.readFileSync(path.join(root, relativePath), "utf8");
    return content.split("\n").slice(0, MAX_LINES_PER_FILE).join("\n");
  } catch {
    return null;
  }
}

function gitSnapshot(root: string): string {
  try {
    const head = execFileSync("git", ["log", "-1", "--oneline"], { cwd: root, encoding: "utf8" }).trim();
    const recent = execFileSync("git", ["log", "-8", "--oneline"], { cwd: root, encoding: "utf8" }).trim();
    const status = execFileSync("git", ["status", "--short"], { cwd: root, encoding: "utf8" }).trim();

    return [
      "Repository history:",
      `- Current HEAD: ${head || "unknown"}`,
      "- Recent commits:",
      recent ? recent.split("\n").map((line) => `  ${line}`).join("\n") : "  none",
      "- Working-tree changes:",
      status ? status.split("\n").slice(0, 30).map((line) => `  ${line}`).join("\n") : "  clean"
    ].join("\n");
  } catch {
    return "Repository history: unavailable; rely on inspected files only.";
  }
}

/**
 * Builds a bounded repository snapshot for assistants.
 * Repository code and data describe implementation state; they never override the Rules Bible.
 * Exact filename matches are always surfaced and read before lower-ranked files so an
 * assistant cannot mistake a ranking omission for proof that a repository file is absent.
 */
export function buildRepositoryContext(query: string, root = process.cwd()): string {
  const exactMatches = findExactMatches(root, query);
  const relevantFiles = findRelevantFiles(root, query);
  const files = Array.from(new Set([...exactMatches, ...relevantFiles])).slice(0, MAX_FILES);

  let output = `${gitSnapshot(root)}\n\nRepository inspection results:\n`;
  output += files.length
    ? files.map((file) => `- ${file}`).join("\n")
    : "- No relevant source files found.";

  output += "\n\nVerified exact filename matches:\n";
  output += exactMatches.length
    ? exactMatches.map((file) => `- EXISTS: ${file}`).join("\n")
    : "- None for the queried terms.";

  output += "\n\nRepository evidence rule:\n";
  output += "- A file listed as EXISTS above is present in the inspected working tree.\n";
  output += "- A file not listed is NOT evidence that the file does not exist; report it only as not found in this bounded inspection.\n";
  output += "- Existing data is repository evidence only and does not establish Rules Bible approval.\n";

  output += "\n\nRelevant file excerpts:\n";

  let chars = output.length;

  // Exact matches are intentionally read first.
  for (const file of files) {
    const content = readSafe(root, file);
    if (!content) continue;

    const section = `\n--- ${file} ---\n${content}\n`;
    if (chars + section.length > MAX_TOTAL_CHARS) break;

    output += section;
    chars += section.length;
  }

  return output;
}
