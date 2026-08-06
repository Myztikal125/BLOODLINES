import fs from "fs";

const SAVE_FILE = "savegame.json";

export function saveGame(data: any) {
  fs.writeFileSync(
    SAVE_FILE,
    JSON.stringify(data, null, 2)
  );
}

export function loadGame() {
  if (!fs.existsSync(SAVE_FILE)) {
    return null;
  }

  return JSON.parse(
    fs.readFileSync(SAVE_FILE, "utf8")
  );
}
