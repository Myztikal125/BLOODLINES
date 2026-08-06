import fs from "fs";

export function loadData(folder: string, id: string) {
  const file = `data/${folder}/${id}.json`;

  if (!fs.existsSync(file)) {
    throw new Error(`Data file not found: ${file}`);
  }

  return JSON.parse(
    fs.readFileSync(file, "utf8")
  );
}
