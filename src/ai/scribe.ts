import { askAI } from "./aiClient";
import fs from "fs";

export async function createCheckpoint(update: string) {

  const rulesBible = fs.existsSync("docs/RULES_BIBLE.md")
    ? fs.readFileSync("docs/RULES_BIBLE.md", "utf8")
    : "Rules Bible not found.";

  const prompt = `
You are the BLOODLINES Scribe Assistant.

Your role:
- Maintain authoritative project documentation.
- Summarize completed work and project state.
- Preserve the distinction between approved rules and unresolved decisions.
- When explicitly given an approved-decision update order, prepare a controlled Rules Bible update.
- Never invent mechanics or approve decisions yourself.

Current Rules Bible:

${rulesBible}

Project update:

${update}

Rules Bible handling:
- The current Rules Bible is authoritative.
- Do not downgrade an approved rule to unresolved because an older audit says otherwise.
- Do not add implementation details that the human has not approved.
- Do not silently change existing approved rules.
- Historical audits and old AI outputs are not authoritative.

For a normal checkpoint, return:

# Completed

# Current Status

# Next Steps

# Notes

If the input explicitly requests a Rules Bible update, also return:

# Rules Bible Changes

List only the approved changes that should be incorporated. Do not write the file unless the caller explicitly authorizes the controlled update operation.
`;

  const summary = await askAI(prompt);

  fs.appendFileSync(
    "docs/AI_HANDOFF.md",
    `\n\n---\n\n${summary}\n`
  );

  return summary;
}
