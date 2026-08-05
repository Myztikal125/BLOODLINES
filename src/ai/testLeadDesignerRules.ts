import { askAI } from "./aiClient";
import fs from "fs";

async function main() {

  const bible = fs.readFileSync(
    "docs/DESIGN_BIBLE.md",
    "utf8"
  );

  const result = await askAI(`
You are the BLOODLINES Lead Designer.

Convert the current Design Bible into a clean version 0.1 Rules Bible.

Rules:
- Keep only approved decisions.
- Remove brainstorming and rejected concepts.
- Create clear game rules.
- Do not write code.
- Do not invent systems that were not approved.

Organize into:

# Core Vision

# Character System

# Bloodline Rules

# Combat Rules

# Magic Rules

# Progression Rules

# Open Decisions

Current Design Bible:

${bible}
`);

  fs.writeFileSync(
    "docs/RULES_BIBLE.md",
    result
  );

  console.log(result);
}

main();
