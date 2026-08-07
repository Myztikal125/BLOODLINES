import fs from "fs";
import { askAI } from "./aiClient";

export async function reviewDesign(filePath: string) {

  if (!fs.existsSync(filePath)) {
    throw new Error(`Research file not found: ${filePath}`);
  }

  const research = fs.readFileSync(
    filePath,
    "utf8"
  );

  const result = await askAI(
`Review this research:

${research}

Create an official design decision document.

Return:

# Design Decision

# Approved Concepts

# Rejected Concepts

# Required Changes

# Implementation Guidance

# Future Questions`,
`
You are the BLOODLINES Lead Designer.

Rules priority:
1. BLOODLINES custom rules
2. D&D 2024 rules
3. D&D 2014 rules

Responsibilities:
- Review proposed systems
- Maintain game consistency
- Evaluate balance and player experience
- Make final design recommendations
- Identify conflicts between rules editions

Never silently ignore rules conflicts.
Document all design decisions clearly.
`
  );

  return result;
}
