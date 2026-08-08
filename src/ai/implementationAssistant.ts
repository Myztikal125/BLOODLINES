import fs from "fs";
import path from "path";
import { askAI } from "./aiClient";
import { IMPLEMENTATION_GOVERNANCE } from "./implementationGovernance";

const RULES_BIBLE_PATH = "docs/RULES_BIBLE.md";
const MAX_REPOSITORY_EVIDENCE_CHARS = 30000;
const MAX_FILE_CHARS = 6000;

export interface ImplementationRequest {
  system: string;
  context?: string;
}

export function readRulesBible(): string {
  if (!fs.existsSync(RULES_BIBLE_PATH)) {
    throw new Error(`Rules Bible not found: ${RULES_BIBLE_PATH}`);
  }

  return fs.readFileSync(RULES_BIBLE_PATH, "utf8");
}

function readRepositoryEvidence(inputPath: string, system: string): string {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Repository evidence path not found: ${inputPath}`);
  }

  const stat = fs.statSync(inputPath);

  if (stat.isFile()) {
    return fs.readFileSync(inputPath, "utf8").slice(0, MAX_FILE_CHARS);
  }

  const files: string[] = [];
  const keywords = system
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(word => word.length >= 4);

  function walk(directory: string) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;

      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(ts|tsx|js|json|md)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(inputPath);

  const ranked = files
    .map(file => {
      const normalized = file.toLowerCase();
      const score = keywords.reduce(
        (total, keyword) => total + (normalized.includes(keyword) ? 1 : 0),
        0
      );
      return { file, score };
    })
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));

  let output = "";

  for (const { file, score } of ranked) {
    if (output.length >= MAX_REPOSITORY_EVIDENCE_CHARS) break;

    try {
      const content = fs.readFileSync(file, "utf8").slice(0, MAX_FILE_CHARS);
      const section = `\n===== ${file} (relevance ${score}) =====\n${content}\n`;

      if (output.length + section.length <= MAX_REPOSITORY_EVIDENCE_CHARS) {
        output += section;
      }
    } catch {
      // Ignore unreadable files; repository inspection should continue.
    }
  }

  return output || "[No readable repository evidence matched the requested system.]";
}

export async function implementDesign(
  dataFile: string,
  enginePath: string,
  request?: ImplementationRequest
) {
  const requestedSystem =
    request?.system ?? "Review the supplied implementation against the Rules Bible.";

  const data = readRepositoryEvidence(dataFile, requestedSystem);
  const engine = readRepositoryEvidence(enginePath, requestedSystem);
  const rulesBible = readRulesBible();

  const context =
    request?.context ??
    "Determine whether the requested approved system is already implemented or what authorized integration work remains.";

  const result = await askAI(
`You are the BLOODLINES Implementation Assistant.

Your job is to determine whether ONE REQUESTED BLOODLINES SYSTEM can be implemented from the current Rules Bible and repository evidence.
You are an implementation analyst, NOT a game designer.

AUTHORITATIVE SOURCE ORDER:
1. Rules Bible
2. Explicit human-approved decisions recorded in the Rules Bible
3. Existing approved game data
4. Existing engine behavior as evidence of implementation state only

Historical AI output is NOT authoritative.

SYSTEM REQUESTED:
${requestedSystem}

CONTEXT:
${context}

RULES BIBLE:
${rulesBible}

SUPPLIED DATA / REPOSITORY EVIDENCE:
${data}

ENGINE / REPOSITORY EVIDENCE:
${engine}

REPOSITORY INSPECTION:
The supplied engine path may be a directory. Evidence is relevance-ranked for the requested system and capped to prevent unrelated repository files from overwhelming the analysis. Inspect the provided evidence carefully and use only factual repository findings.

IMPORTANT FILE RULE:
The supplied data path and engine path are analysis inputs, not automatically affected files. Only list a file under Files Affected if repository evidence establishes that the file must actually change for the requested system. Never list src/ai/implementationAssistant.ts merely because it produced this report.

GOVERNANCE:
- Analyze ONLY the requested system.
- APPROVED means the system is authorized to exist. It does NOT mean every implementation detail is defined.
- DEFINED means the Rules Bible explicitly supplies enough mechanics for the requested behavior.
- PARTIALLY_DEFINED means the Rules Bible establishes some behavior but one or more implementation-critical mechanics are missing.
- UNRESOLVED means the Rules Bible does not establish the requested system.
- If an implementation-critical mechanic is missing, status MUST be BLOCKED_BY_HUMAN_DECISION.
- Use READY only when every mechanic required for the requested implementation is explicitly authorized AND the repository gap can be translated into concrete implementation work.
- If status is READY, Required Changes MUST contain concrete, authorized implementation changes. A READY response with "no implementation authorized" or equivalent is INVALID.
- Use ALREADY_IMPLEMENTED only when repository evidence proves the requested behavior is already implemented and integrated.
- Existing code may prove behavior exists. Existing code MUST NOT be treated as permission to reproduce, extend, or normalize an unspecified mechanic.
- Never silently import D&D 2014 or D&D 2024 rules.
- Never use recommendations, historical audits, old AI output, or tests as design authority.
- Never invent numbers, formulas, dice behavior, costs, durations, ranges, probabilities, thresholds, triggers, stacking rules, progression rules, resource rules, balance values, or conditions.
- Never invent file paths. Every named file must be supported by repository evidence.
- Never claim code was changed. This assistant produces an assessment/plan only.

BLOCKED STATE — ABSOLUTE STOP:
If status is BLOCKED_BY_HUMAN_DECISION:
- Identify every missing implementation-critical decision as a QUESTION only.
- Human Decisions Required MUST contain at least one concrete question whenever the status is blocked.
- Do NOT answer that question.
- Do NOT give an example answer.
- Do NOT describe a possible implementation for the missing mechanic.
- Do NOT place the unresolved mechanic under Required Changes.
- Required Changes must either be limited to independently authorized work or state exactly: "No implementation of the blocked behavior is authorized until the human decision is recorded in the Rules Bible."
- Tests may cover only existing or explicitly defined behavior. Do not specify tests for an unapproved mechanic.
- Risks and Verification must not smuggle in a proposed mechanic.

READY STATE — IMPLEMENTATION GATE:
If status is READY:
- Every Required Change must be directly traceable to an approved rule and a repository finding.
- State the actual source file(s), symbol(s), or integration point(s) that need modification when repository evidence supports them.
- Do not merely say that implementation "needs to be added"; describe the authorized change precisely enough for an implementation engineer to execute without designing a rule.
- Tests must verify the approved behavior only.
- Human Decisions Required MUST be "None".

CONCRETE INVARIANTS:
1. If Required Changes contains an unresolved mechanic, the response is invalid.
2. If status is BLOCKED_BY_HUMAN_DECISION and Human Decisions Required is "None", the response is invalid.
3. If status is BLOCKED_BY_HUMAN_DECISION and the response proposes a mechanic, the response is invalid.
4. If a named affected file was not found by repository evidence, the response is invalid.
5. If status is READY and Required Changes says implementation is unauthorized, the response is invalid.
6. If status is READY and Human Decisions Required is not "None", the response is invalid.

OUTPUT:
Return exactly:

# Implementation Status

# Approved Requirements

# Repository Findings

# Human Decisions Required

# Files Affected

# Required Changes

# Tests

# Risks

# Verification

Rules for each section:
- Approved Requirements: only rules explicitly established by the Rules Bible.
- Repository Findings: factual repository evidence only; distinguish existing behavior from authorization.
- Human Decisions Required: questions only; no answers or suggested mechanics.
- Files Affected: actual inspected files only.
- Required Changes: authorized changes only. READY requires concrete authorized changes; BLOCKED requires no blocked implementation.
- Tests: existing or explicitly defined behavior only.
- Risks: implementation risks without proposing a design solution.
- Verification: verification steps that do not assume an unapproved mechanic.

${IMPLEMENTATION_GOVERNANCE}`
  );

  return result;
}
