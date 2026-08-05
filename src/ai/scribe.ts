import { askAI } from "./aiClient";
import fs from "fs";

export async function createCheckpoint(update: string) {

  const prompt = `
You are the BLOODLINES Scribe Assistant.

Your role:
- Maintain project memory
- Summarize completed work
- Track next steps

Rules:
- Do not make design decisions
- Do not modify engine code
- Only document project progress

Create a concise project update from this:

${update}

Return:

# Completed

# Current Status

# Next Steps

# Notes
`;

  const summary = await askAI(prompt);

  fs.appendFileSync(
    "docs/AI_HANDOFF.md",
    `\n\n---\n\n${summary}\n`
  );

  return summary;
}
