import fs from "fs";
import path from "path";

export class DataLoader {

  static load(filePath: string): any {
    const fullPath = path.resolve(filePath);

    const data = fs.readFileSync(fullPath, "utf-8");

    return JSON.parse(data);
  }


  static loadClasses() {
    const classesPath = path.resolve("data/classes");

    const files = fs.readdirSync(classesPath)
      .filter(file => file.endsWith(".json"))
      .filter(file => file !== "class_schema.json")
      .filter(file => file !== "classes.json");

    return files.map(file =>
      this.load(`data/classes/${file}`)
    );
  }


  static loadClass(id: string) {
    return this.load(`data/classes/${id}.json`);
  }


  static loadAncestries() {
    return this.load("data/ancestries/ancestries.json");
  }


  static loadBackgrounds() {
    return this.load("data/backgrounds/backgrounds.json");
  }


  static loadBloodlines() {
    return this.load("data/bloodlines/bloodlines.json");
  }
}
