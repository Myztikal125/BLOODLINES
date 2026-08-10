import fs from "fs";
import path from "path";
import { askAI } from "./aiClient";
import { SUPERPOWERS_RESEARCH_SKILLS } from "./skills/superpowers";

export async function research(topic: string) {
  const result = await askAI(
`Research this topic for BLOODLINES RPG:

${topic}

${SUPERPOWERS_RESEARCH_SKILLS}

Research output rules:
- Separate established rules/facts from design suggestions and unresolved questions.
- Identify source strength and conflicts when relevant.
- Never present a recommendation as an approved BLOODLINES rule.
- Never invent missing mechanics to make a research answer complete.

Return:
- Summary
- Sources / evidence
- Important mechanics
- Design ideas (clearly labeled recommendations)
- Unresolved questions
- Possible implementation notes (neutral unless explicitly authorized)`
  );

  const title = (topic
    .split("\n")
    .find(line => line.trim().length > 0) || "research")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);

  const folder = path.join("research");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const filePath = path.join(
    folder,
    `${title}.md`
  );

  fs.writeFileSync(
    filePath,
    result
  );

  console.log(`Research saved: ${filePath}`);

  return result;
}
