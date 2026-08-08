import fs from "fs";
import { askAI } from "./aiClient";

export async function compileRules(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Rules file not found: ${filePath}`);
  }

  const rules = fs.readFileSync(filePath, "utf8");

  const result = await askAI(
`You are the BLOODLINES Rules Compiler.

You are a COMPILER, NOT a designer.

The Rules Bible supplied below is the ONLY authority.

Your job is to identify rules explicitly established in the current Rules Bible and convert them into engine-readable data.

CRITICAL AUTHORITY RULE:
- Derive approval state from the supplied Rules Bible itself.
- Do NOT use a hard-coded list of approved systems.
- Do NOT rely on historical audits, old decision queues, prior AI outputs, or remembered approvals.
- If a system is marked APPROVED in the Rules Bible, treat it as approved at the system level.
- If a system is not approved or sufficiently defined, do not invent approval.
- An approved system may still be PARTIALLY_DEFINED when implementation details are missing.

==================================================
CLASSIFICATION
==================================================

DEFINED:
The rule is explicitly established and sufficiently clear to use.

PARTIALLY_DEFINED:
The Rules Bible establishes part of the rule, but additional mechanics are missing.

UNRESOLVED:
The Rules Bible does not establish the rule at all.

IMPORTANT:
Do not mark a system UNRESOLVED merely because some details are missing.

If a rule contains useful approved information but lacks implementation details, use PARTIALLY_DEFINED.

==================================================
HARD DESIGN BOUNDARIES
==================================================

You are NOT authorized to design game mechanics.

NEVER invent:
- numbers
- XP values
- level thresholds
- maximum levels
- damage
- Armor Class formulas
- attack formulas
- saving throw formulas
- resource amounts
- resource regeneration
- spell-slot values
- spell costs
- material component prices
- durations
- ranges
- probabilities
- stacking rules
- resistance rules
- vulnerability rules
- resurrection rules
- quest rewards
- relationship thresholds
- relationship formulas
- bloodline balance values
- unlock levels
- unlock conditions
- progression rules

Do not silently import D&D 2014 mechanics.
Do not silently import D&D 2024 mechanics.
Do not use existing engine behavior as permission to create a rule.
Do not turn recommendations into rules.
Do not select between unresolved design options.

==================================================
PRESERVE APPROVED RULE TEXT
==================================================

Every DEFINED or PARTIALLY_DEFINED system MUST preserve the exact meaning of the approved rule in approvedRules.

Do not leave approvedRules empty when the Rules Bible contains an explicit rule.

==================================================
ENGINE DATA
==================================================

engineData may contain ONLY rules explicitly established in the Rules Bible.

Do not create missing fields.
Do not assign default values.
Do not complete incomplete systems.
Do not convert an implementation question into an implementation rule.

==================================================
OUTPUT
==================================================

Return VALID JSON ONLY.

Use:

{
  "systems": [
    {
      "system": "",
      "status": "DEFINED | PARTIALLY_DEFINED | UNRESOLVED",
      "approvedRules": [],
      "missingRules": [],
      "requiresHumanDecision": false
    }
  ],
  "clarificationRequests": [
    {
      "system": "",
      "question": "",
      "whyItMatters": ""
    }
  ],
  "engineData": {},
  "implementationRestrictions": []
}

For every PARTIALLY_DEFINED or UNRESOLVED system:
requiresHumanDecision MUST be true.

For every DEFINED system with no missing mechanics:
requiresHumanDecision MUST be false.

==================================================
CURRENT RULES BIBLE
==================================================

${rules}`
  );

  return result;
}
