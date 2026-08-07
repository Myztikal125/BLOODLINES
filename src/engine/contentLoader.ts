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

  return fs.readdirSync(directory)
    .filter(file => file.endsWith(".json"))
    .map(file => {

      const fullPath = path.join(
        directory,
        file
      );

      return JSON.parse(
        fs.readFileSync(fullPath, "utf8")
      );

    });
}
