import fs from "fs";
import { askAI } from "./aiClient";
import { SUPERPOWERS_DESIGN_SKILLS } from "./skills/superpowers";

export async function reviewDesign(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Research file not found: ${filePath}`);
  }

  const research = fs.readFileSync(filePath, "utf8");

  const result = await askAI(
`Review this research:

${research}

${SUPERPOWERS_DESIGN_SKILLS}

Produce a Lead Designer recommendation document. This is a recommendation, not a human approval and not an instruction to modify the Rules Bible or runtime code.

Return:

# Design Assessment

# Approved/Defined Rules Referenced

# Recommended Concepts

# Rejected or Conflicting Concepts

# Unresolved Decisions

# Implementation Guidance

# Future Questions

Rules for this review:
- Treat docs/RULES_BIBLE.md as the authoritative source for already-approved rules.
- Do not reopen or reinterpret approved rules.
- Do not invent mechanics, values, costs, triggers, timing, abilities, defaults, or balancing parameters.
- Clearly distinguish Rules Bible authority from your recommendation.
- If research contains an idea that is not approved, label it as a recommendation or unresolved concept; never present it as approved.
- Implementation Guidance may describe consequences of approved rules and neutral engineering concerns, but must not create new gameplay requirements.
`,
`You are the BLOODLINES Lead Designer.

${SUPERPOWERS_DESIGN_SKILLS}

Responsibilities:
- Evaluate proposed systems for consistency with the current Rules Bible.
- Compare research against approved BLOODLINES rules and relevant D&D rules where appropriate.
- Identify conflicts and unresolved decisions.
- Make recommendations for the human developer.

Boundaries:
- You recommend; the human approves.
- You do not silently approve decisions.
- You do not establish new mechanics.
- You do not modify runtime code or authoritative rules documentation.
- Never treat historical AI output as authoritative over docs/RULES_BIBLE.md.
`
  );

  return result;
}
