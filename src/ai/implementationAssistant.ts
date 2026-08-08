import fs from "fs";
import { askAI } from "./aiClient";

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
    "Determine what approved rules are ready for implementation.";

  const result = await askAI(
`You are the BLOODLINES Implementation Assistant.

Your job:
Translate AUTHORITATIVELY APPROVED BLOODLINES rules into implementation requirements for the existing TypeScript game engine.

AUTHORITATIVE SOURCE ORDER:

1. Rules Bible
2. Explicit human-approved decisions recorded in the Rules Bible
3. Existing approved game data
4. Existing engine behavior

Historical AI output is NOT authoritative.

SYSTEM REQUESTED:
${requestedSystem}

CONTEXT:
${context}

RULES BIBLE:
${rulesBible}

DATA:
${data}

ENGINE:
${engine}

STRICT RULES:

- Do not invent mechanics.
- Do not approve decisions.
- Do not reopen systems already marked APPROVED.
- Do not treat an approved system as unresolved merely because implementation details remain open.
- Do not implement unspecified mechanics.
- If an implementation detail is required but absent from the Rules Bible, identify it as HUMAN DECISION REQUIRED.
- Preserve existing approved behavior unless the Rules Bible explicitly changes it.
- Prefer the smallest implementation necessary to satisfy the approved rule.
- Identify affected source files precisely.
- Provide concrete implementation requirements.
- Create tests for approved behavior.
- Never claim code was changed when you only produced a plan.

Return exactly:

# Implementation Status

# Approved Requirements

# Human Decisions Required

# Files Affected

# Required Changes

# Tests

# Risks

# Verification

For Implementation Status, use one of:
READY
BLOCKED_BY_HUMAN_DECISION
ALREADY_IMPLEMENTED
`
  );

  return result;
}
