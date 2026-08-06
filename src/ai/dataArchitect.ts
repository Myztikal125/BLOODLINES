import { askAI } from "./aiClient";

export async function architectData(rules: string) {

  const result = await askAI(
`You are the BLOODLINES Data Architect.

Your job:
Convert approved Rules Compiler output into clean engine data.

Requirements:

- Output ONLY valid JSON.
- Separate systems into files.
- Use unique IDs instead of display names.
- Keep data compatible with a TypeScript RPG engine.
- Do not invent new mechanics.
- Preserve approved design decisions.

Create these sections:

classes/
magic/
combat/
bloodlines/
progression/

Rules:

${rules}`
  );

  return result;
}
