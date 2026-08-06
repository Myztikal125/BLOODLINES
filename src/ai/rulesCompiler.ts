import fs from "fs";
import { askAI } from "./aiClient";

export async function compileRules(filePath: string) {

  if (!fs.existsSync(filePath)) {
    throw new Error(`Rules file not found: ${filePath}`);
  }

  const rules = fs.readFileSync(filePath, "utf8");

  const result = await askAI(
`You are the BLOODLINES Rules Compiler.

Convert this approved design document into engine data.

Rules:
- Do not invent new mechanics.
- Only use approved concepts.
- Output valid JSON.
- Separate systems clearly.

Create:
- classes
- abilities
- resources
- progression
- costs
- unlock requirements

Approved Design:

${rules}`
  );

  return result;
}
