import fs from "fs";
import path from "path";

export function loadContent(folder: string) {
  const directory = path.join(
    process.cwd(),
    "data",
    folder
  );

  if (!fs.existsSync(directory)) {
    return [];
  }

  const results: any[] = [];

  for (const file of fs.readdirSync(directory)) {
    if (!file.endsWith(".json")) continue;

    const fullPath = path.join(directory, file);

    const data = JSON.parse(
      fs.readFileSync(fullPath, "utf8")
    );

    if (Array.isArray(data)) {
      results.push(...data);
    } else {
      results.push(data);
    }
  }

  return results;
}
