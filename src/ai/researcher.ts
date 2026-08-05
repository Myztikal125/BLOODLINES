import { askAI } from "./aiClient";
import fs from "fs";
import path from "path";

export async function research(topic: string) {

  const prompt = `
You are the BLOODLINES Researcher Assistant.

Your job:
- Gather RPG knowledge
- Compare existing systems
- Suggest mechanics
- Create research notes

Restrictions:
- Do not modify engine code
- Do not make final design decisions
- Provide information for the Lead Designer

Research Topic:
${topic}

Return:

# Summary

# Existing Systems

# Important Mechanics

# Strengths

# Weaknesses

# BLOODLINES Ideas

# Implementation Notes

# Questions For Lead Designer
`;

  const result = await askAI(prompt);

  const folder = path.join("research", "rules");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const filename =
    topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_") + ".md";

  fs.writeFileSync(
    path.join(folder, filename),
    result
  );

  return result;
}
