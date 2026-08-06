import fs from "fs";
import { askAI } from "./aiClient";

export async function implementDesign(
  dataFile: string,
  engineFile: string
) {
  const data = fs.readFileSync(dataFile, "utf8");
  const engine = fs.readFileSync(engineFile, "utf8");

  const result = await askAI(
`You are the BLOODLINES Implementation Assistant.

Your job:
Connect approved game data to the TypeScript engine.

Rules:
- Do not invent mechanics.
- Only use approved data.
- Identify missing integrations.
- Suggest exact code changes.
- Create tests.

Data:
${data}

Engine:
${engine}

Return:

# Integration Issues

# Required Changes

# Tests`
  );

  return result;
}
