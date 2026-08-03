import fs from "fs";
import path from "path";

export class DataLoader {
  static load(filePath: string): any {
    const fullPath = path.resolve(filePath);

    const data = fs.readFileSync(fullPath, "utf-8");

    return JSON.parse(data);
  }

  static loadAncestries() {
    return this.load("data/ancestries/ancestries.json");
  }

  static loadClasses() {
    return this.load("data/classes/classes.json");
  }

  static loadBackgrounds() {
    return this.load("data/backgrounds/backgrounds.json");
  }

  static loadBloodlines() {
    return this.load("data/bloodlines/bloodlines.json");
  }
}
