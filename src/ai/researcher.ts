import fs from "fs";
import path from "path";
import { askAI } from "./aiClient";

export async function research(topic: string) {
  const result = await askAI(
`Research this topic for BLOODLINES RPG:

${topic}

Return:
- Summary
- Important mechanics
- Design ideas
- Possible implementation notes`
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
