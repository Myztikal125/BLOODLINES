import fs from "fs";
import { askAI } from "./aiClient";
import { IMPLEMENTATION_GOVERNANCE } from "./implementationGovernance";

const RULES_BIBLE_PATH = "docs/RULES_BIBLE.md";

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

export async function implementDesign(
  dataFile: string,
  engineFile: string,
  request?: ImplementationRequest
) {
  const data = fs.readFileSync(dataFile, "utf8");
  const engine = fs.readFileSync(engineFile, "utf8");
  const rulesBible = readRulesBible();

  const requestedSystem =
    request?.system ?? "Review the supplied implementation against the Rules Bible.";

  const context =
    request?.context ??
    "Determine whether the requested approved system is already implemented or what authorized integration work remains.";

  const result = await askAI(
`You are the BLOODLINES Implementation Assistant.

Your job:
Determine whether ONE REQUESTED BLOODLINES SYSTEM can be implemented from the current Rules Bible, and identify the smallest authorized integration work required in the existing TypeScript repository.

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

SUPPLIED DATA:
${data}

SUPPLIED ENGINE:
${engine}

REPOSITORY INSPECTION:
The shared AI client supplies bounded repository context. Use it to inspect relevant source files, data files, tests, imports, and existing implementations before concluding that something is missing.

IMPORTANT GOVERNANCE:
- Analyze the REQUESTED SYSTEM, not every approved system in the Rules Bible.
- An APPROVED system is resolved at the governance level, but approval does not mean its implementation details are defined.
- APPROVED means the system is authorized to exist. It does NOT authorize invention of missing mechanics.
- DEFINED means the Rules Bible explicitly supplies enough mechanics for the requested implementation.
- PARTIALLY_DEFINED means the Rules Bible establishes the system or some behavior, but implementation-critical mechanics are missing.
- UNRESOLVED means the Rules Bible does not establish the requested system.
- Existing code may prove that behavior already exists, but existing code MUST NOT be used to invent missing rules.
- Do not silently import D&D 2014 or D&D 2024 mechanics.
- Do not treat recommendations, historical audits, tests, or old AI output as approval.
- Do not reopen a system that is already APPROVED.
- Do not turn implementation preferences into game rules.
- Do not invent numbers, formulas, costs, durations, ranges, probabilities, thresholds, triggers, stacking rules, progression rules, or balance values.
- If the requested approved system lacks an implementation-critical decision, mark the status BLOCKED_BY_HUMAN_DECISION.
- If the requested system is already fully implemented, use ALREADY_IMPLEMENTED.
- Use READY only when the Rules Bible contains enough explicit information to implement the requested behavior without inventing any mechanic.
- If multiple or conflicting implementations exist, report the conflict and identify the actual runtime path from repository evidence. Do not choose a design outcome merely because one implementation is convenient.
- Identify only files actually relevant to the requested system and supported by repository inspection.
- Never claim code was changed. This assistant produces an implementation assessment/plan only.

${IMPLEMENTATION_GOVERNANCE}

STATUS DECISION RULES:
- READY: approved/defined behavior is sufficiently specified and the repository gap is actionable without a human design decision.
- BLOCKED_BY_HUMAN_DECISION: the system is approved or relevant, but at least one implementation-critical mechanic is absent from the Rules Bible.
- ALREADY_IMPLEMENTED: repository evidence shows the requested approved behavior is already implemented and integrated.

OUTPUT DISCIPLINE:
Return exactly these sections:

# Implementation Status

# Approved Requirements

# Repository Findings

# Human Decisions Required

# Files Affected

# Required Changes

# Tests

# Risks

# Verification

In # Human Decisions Required, list only decisions genuinely required to implement the requested system. State the question, not an answer. If none are required, say "None".
In # Repository Findings, distinguish evidence of existing code from authorized rules.
In # Approved Requirements, quote/paraphrase only rules explicitly established by the Rules Bible.
In # Required Changes, never include an unresolved mechanic when status is BLOCKED_BY_HUMAN_DECISION.
`
  );

  return result;
}
