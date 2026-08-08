import fs from "fs";
import { askAI } from "./aiClient";

async function main() {
  const biblePath = "docs/RULES_BIBLE.md";
  const auditPath = "docs/RULES_AUDIT.md";

  if (!fs.existsSync(biblePath)) {
    throw new Error(`Missing ${biblePath}`);
  }

  if (!fs.existsSync(auditPath)) {
    throw new Error(`Missing ${auditPath}`);
  }

  const rulesBible = fs.readFileSync(biblePath, "utf8");
  const audit = fs.readFileSync(auditPath, "utf8");

  const result = await askAI(
`You are the BLOODLINES Rules Clarification Assistant.

Your job is to identify ONLY unresolved game-design decisions.

The HUMAN DESIGNER has final authority.

IMPORTANT RULE:

A rule explicitly approved in the Rules Bible is FINAL.

Never ask the human to approve an already-approved rule again.

Never revoke, modify, reinterpret, or replace an approved rule.

Never turn an assistant recommendation into an approved rule.

Never invent mechanics.

Never assume a D&D 2014 or D&D 2024 mechanic unless the BLOODLINES Rules Bible explicitly adopts it.

SOURCE OF TRUTH:

${rulesBible}

LEAD DESIGNER AUDIT:

${audit}

Previously approved decisions include:

- Advantage and Disadvantage
- Death and Dying
- NPC Relationships and Memory
- Comprehensive Quest Structure
- Comprehensive Rewards

These must NOT appear in the decision queue again.

Classify every audited system as one of:

APPROVED
PARTIALLY_DEFINED
UNRESOLVED
MISSING

Rules:

APPROVED:
Do not ask a question.

PARTIALLY_DEFINED:
Identify only the missing mechanics that require human approval.

UNRESOLVED:
Create a decision.

MISSING:
Create a decision if the system is required by the game design.

Prioritize decisions that block implementation of other systems.

Do not ask broad questions when a specific mechanical decision is required.

For example, instead of:

"What should combat be like?"

ask:

"What resource should actions consume?"

Return VALID JSON ONLY:

{
  "approvedSystems": [],
  "decisionQueue": [
    {
      "id": "",
      "system": "",
      "status": "PARTIALLY_DEFINED",
      "question": "",
      "whyItMatters": "",
      "options": [
        {
          "id": "A",
          "description": ""
        },
        {
          "id": "B",
          "description": ""
        }
      ],
      "dependencies": [],
      "blocksImplementation": true
    }
  ]
}

The human may answer:

A
B
A + B
Custom: ...

Until the human approves a decision, it remains unresolved.

Do not implement unresolved mechanics.`
  );

  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
