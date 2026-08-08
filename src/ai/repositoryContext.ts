import fs from "fs";
import path from "path";

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

const MAX_FILES = 12;
const MAX_LINES_PER_FILE = 80;
const MAX_TOTAL_CHARS = 18000;

function collectFiles(root: string, current = root, files: string[] = []): string[] {
  if (files.length >= 250) return files;

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
  return terms.reduce(
    (score, term) => score + (normalized.includes(term) ? 5 : 0),
    0
  );
}

function findRelevantFiles(root: string, query: string): string[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((term) => term.length >= 4)
    .slice(0, 20);

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

/**
 * Builds a bounded repository snapshot for assistants.
 * Repository code describes implementation state; it never overrides the Rules Bible.
 */
export function buildRepositoryContext(query: string, root = process.cwd()): string {
  const files = findRelevantFiles(root, query);
  let output = "Repository inspection results:\n";
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
