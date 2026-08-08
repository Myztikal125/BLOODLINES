import { askAI } from "./aiClient";
import fs from "fs";

const RULES_BIBLE_PATH = "docs/RULES_BIBLE.md";
const AI_HANDOFF_PATH = "docs/AI_HANDOFF.md";

export interface ApprovedDecision {
  id: string;
  system: string;
  decision: string;
}

export interface RulesBibleState {
  system: string;
  status: "APPROVED";
  decision: string;
}

/**
 * Reads the current authoritative Rules Bible.
 */
export function readRulesBible(): string {
  if (!fs.existsSync(RULES_BIBLE_PATH)) {
    throw new Error(`Rules Bible not found: ${RULES_BIBLE_PATH}`);
  }

  return fs.readFileSync(RULES_BIBLE_PATH, "utf8");
}

/**
 * Normalizes a system name so comparisons are deterministic.
 */
function normalizeSystemName(system: string): string {
  return system
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Creates the canonical approved-decision entry.
 */
function createApprovedEntry(decision: ApprovedDecision): string {
  return `### ${decision.system}

**Status:** APPROVED

**Human Decision:** ${decision.decision}

**Governance:** This system is approved and must not be reopened as an unresolved system decision. Any implementation details not explicitly approved remain subject to future clarification.
`;
}

/**
 * Creates a canonical Approved Decisions section.
 *
 * This section is the authoritative governance registry.
 */
function createApprovedSection(
  decisions: ApprovedDecision[]
): string {
  const unique = new Map<string, ApprovedDecision>();

  for (const decision of decisions) {
    unique.set(normalizeSystemName(decision.system), decision);
  }

  const entries = Array.from(unique.values())
    .map(createApprovedEntry)
    .join("\n");

  return `## Approved Decisions

${entries}`.trimEnd();
}

/**
 * Extracts currently approved systems from the existing Bible.
 *
 * This prevents a new batch from accidentally deleting previous
 * approvals.
 */
function extractApprovedDecisions(
  bible: string
): ApprovedDecision[] {
  const sectionMatch = bible.match(
    /## Approved Decisions\s*([\s\S]*?)(?=\n## |\s*$)/
  );

  if (!sectionMatch) {
    return [];
  }

  const section = sectionMatch[1];

  const matches = [
    ...section.matchAll(
      /### (.+?)\n\n\*\*Status:\*\* APPROVED\n\n\*\*Human Decision:\*\* (.+?)(?:\n\n|\r?\n)/g
    )
  ];

  return matches.map((match, index) => ({
    id: `existing-${index + 1}`,
    system: match[1].trim(),
    decision: match[2].trim()
  }));
}

/**
 * Rebuilds the authoritative Approved Decisions registry.
 *
 * Existing approvals are preserved.
 * New human approvals are merged.
 * No AI output is allowed to modify this registry.
 */
export function applyApprovedDecisions(
  decisions: ApprovedDecision[]
): string {
  if (decisions.length === 0) {
    throw new Error("No approved decisions supplied.");
  }

  let bible = readRulesBible();

  const existing = extractApprovedDecisions(bible);

  const merged = new Map<string, ApprovedDecision>();

  for (const decision of existing) {
    merged.set(normalizeSystemName(decision.system), decision);
  }

  for (const decision of decisions) {
    merged.set(normalizeSystemName(decision.system), decision);
  }

  const approvedSection = createApprovedSection(
    Array.from(merged.values())
  );

  const sectionRegex =
    /## Approved Decisions[\s\S]*?(?=\n## |\s*$)/;

  if (sectionRegex.test(bible)) {
    bible = bible.replace(sectionRegex, approvedSection);
  } else {
    bible = `${bible.trim()}\n\n${approvedSection}\n`;
  }

  fs.writeFileSync(
    RULES_BIBLE_PATH,
    bible,
    "utf8"
  );

  return bible;
}

/**
 * Sends an explicitly approved batch to the Scribe.
 *
 * The Scribe produces a report only.
 * The deterministic apply function controls the actual Bible.
 */
export async function prepareRulesBibleUpdate(
  decisions: ApprovedDecision[]
): Promise<string> {
  if (decisions.length === 0) {
    throw new Error("No approved decisions supplied.");
  }

  const rulesBible = readRulesBible();

  const decisionText = decisions
    .map(
      (decision) =>
        `Decision ${decision.id}
System: ${decision.system}
Human Decision: ${decision.decision}`
    )
    .join("\n\n");

  const prompt = `
You are the BLOODLINES Scribe Assistant.

You have received an EXPLICIT HUMAN-APPROVED RULES BIBLE UPDATE ORDER.

The Rules Bible is authoritative.

Current Rules Bible:

${rulesBible}

Approved decisions:

${decisionText}

Rules:

1. Treat the supplied human decisions as authoritative.
2. Do not approve anything not explicitly supplied.
3. Do not reject anything explicitly approved.
4. Do not reopen an already approved system.
5. Do not use historical audits or old AI outputs as authority.
6. Do not invent mechanics.
7. Distinguish an approved SYSTEM DECISION from unresolved IMPLEMENTATION DETAILS.
8. Existing approved rules must be preserved.
9. An implementation question may remain open without making its parent system unresolved.

Return ONLY:

# Rules Bible Changes

For each supplied decision:

- System:
- Status: APPROVED
- Approved rule:
- Implementation details still unresolved:
`;

  return askAI(prompt);
}

/**
 * Creates a normal project checkpoint.
 */
export async function createCheckpoint(
  update: string
): Promise<string> {
  const rulesBible = readRulesBible();

  const prompt = `
You are the BLOODLINES Scribe Assistant.

Your role:
- Maintain authoritative project documentation.
- Summarize completed work and project state.
- Preserve the distinction between approved rules and unresolved decisions.
- Never invent mechanics.
- Never approve decisions yourself.
- Historical audits and old AI outputs are not authoritative.

Current Rules Bible:

${rulesBible}

Project update:

${update}

For a normal checkpoint, return:

# Completed
# Current Status
# Next Steps
# Notes
`;

  const summary = await askAI(prompt);

  fs.appendFileSync(
    AI_HANDOFF_PATH,
    `\n\n---\n\n${summary}\n`
  );

  return summary;
}
