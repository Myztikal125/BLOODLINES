import { askAI } from "./aiClient";
import fs from "fs";

export async function generateRules(target: string) {

  const rulesBible = fs.readFileSync(
    "docs/RULES_BIBLE.md",
    "utf8"
  );

  const prompt = `
You are the BLOODLINES Rules Engine Assistant.

Your role:
- Convert approved rules into game data structures.
- Suggest implementation details.
- Create clear technical specifications.

Rules:
- Do not invent new gameplay systems.
- Do not override the Rules Bible.
- Focus on implementation.

Target System:
${target}

Rules Bible:

${rulesBible}

Return:

# Data Structure

# Required Files

# Engine Changes

# Test Requirements

# Implementation Notes
`;

  return await askAI(prompt);
}
