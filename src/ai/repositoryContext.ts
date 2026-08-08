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

const MAX_FILES = 18;
const MAX_LINES_PER_FILE = 100;
const MAX_TOTAL_CHARS = 24000;

function collectFiles(root: string, current = root, files: string[] = []): string[] {
  if (files.length >= 500) return files;

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

function scoreFile(file: string, terms: string[]): number {
  const normalized = file.toLowerCase();
  const basename = path.basename(normalized);

  return terms.reduce((score, term) => {
    if (basename === term || basename === `${term}.ts` || basename === `${term}.json` || basename === `${term}.md`) {
      return score + 20;
    }

    return score + (normalized.includes(term) ? 5 : 0);
  }, 0);
}

function findRelevantFiles(root: string, query: string): string[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((term) => term.length >= 4)
    .slice(0, 30);

  const files = collectFiles(root);
  const scored = files
    .map((file) => ({ file, score: scoreFile(file, terms) }))
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));

  return scored.slice(0, MAX_FILES).map(({ file }) => file);
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
    const recent = execFileSync("git", ["log", "-5", "--oneline"], { cwd: root, encoding: "utf8" }).trim();
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
 * The snapshot also includes recent Git history so assistants can distinguish current work
 * from stale historical context.
 */
export function buildRepositoryContext(query: string, root = process.cwd()): string {
  const files = findRelevantFiles(root, query);
  let output = `${gitSnapshot(root)}\n\nRepository inspection results:\n`;
  output += files.length
    ? files.map((file) => `- ${file}`).join("\n")
    : "- No relevant source files found.";

  output += "\n\nRelevant file excerpts:\n";

  let chars = output.length;

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
