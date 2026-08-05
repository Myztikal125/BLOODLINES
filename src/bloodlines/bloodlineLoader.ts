import fs from "fs";
import path from "path";

export function loadBloodline(id: string) {
  const file = path.join(
    "data",
    "bloodlines",
    `${id}.json`
  );

  if (!fs.existsSync(file)) {
    throw new Error(`Bloodline not found: ${id}`);
  }

  return JSON.parse(
    fs.readFileSync(file, "utf8")
  );
}
