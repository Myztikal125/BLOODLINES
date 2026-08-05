import { askAI } from "./aiClient";
import fs from "fs";
import path from "path";

export async function reviewDesign(researchFile: string) {

  const filePath = path.join("research", "rules", researchFile);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Research file not found: ${filePath}`);
  }

  const research = fs.readFileSync(filePath, "utf8");

  const prompt = `
You are the BLOODLINES Lead Designer Assistant.

Your role:
- Review research
- Make design recommendations
- Define official BLOODLINES systems

Rules:
- Do not write engine code
- Do not change files outside approved design documents
- Preserve BLOODLINES vision

Review this research:

${research}

Return:

# Design Decision

# Approved Concepts

# Rejected Concepts

# Required Changes

# Implementation Guidance

# Future Questions
`;

  const decision = await askAI(prompt);

  const biblePath = "docs/DESIGN_BIBLE.md";

  fs.appendFileSync(
    biblePath,
    `\n\n---\n\n# New Design Review\n\n${decision}\n`
  );

  return decision;
}
