import fs from "fs";

export function loadClass(classId: string) {
  const file = `data/classes/${classId}.json`;

  if (!fs.existsSync(file)) {
    throw new Error(`Class data not found: ${file}`);
  }

  return JSON.parse(
    fs.readFileSync(file, "utf8")
  );
}
