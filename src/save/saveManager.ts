import fs from "fs";
import path from "path";

const savePath = path.join(process.cwd(), "savegame.json");

export function loadGame() {
  if (!fs.existsSync(savePath)) {
    return null;
  }

  const data = fs.readFileSync(savePath, "utf-8");
  return JSON.parse(data);
}

export function saveGame(state: any) {
  fs.writeFileSync(
    savePath,
    JSON.stringify(state, null, 2)
  );
}
