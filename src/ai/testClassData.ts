import { askAI } from "./aiClient";
import fs from "fs";

async function generateClassData(className: string) {
  const result = await askAI(`
Generate a complete JSON data object for the ${className} class in BLOODLINES RPG (D&D inspired).

Return ONLY valid JSON with this structure, no markdown, no explanation:
{
  "id": "${className}",
  "name": "...",
  "description": "...",
  "hitDie": "d6|d8|d10|d12",
  "primaryAbility": "strength|dexterity|constitution|intelligence|wisdom|charisma",
  "savingThrows": ["...", "..."],
  "armorProficiencies": ["..."],
  "weaponProficiencies": ["..."],
  "startingHP": 0,
  "features": [
    { "level": 1, "name": "...", "description": "..." },
    { "level": 2, "name": "...", "description": "..." }
  ],
  "bloodlineBonus": "..."
}
`);

  const cleaned = result.replace(/\`\`\`json/g,"").replace(/\`\`\`/g,"").trim();
  return JSON.parse(cleaned);
}

async function main() {
  const classes = ["wizard", "fighter", "rogue", "cleric", "ranger"];
  const allClasses = [];

  for (const cls of classes) {
    console.log(`Generating ${cls} data...`);
    try {
      const data = await generateClassData(cls);
      allClasses.push(data);
      console.log(`✓ ${cls} done`);
    } catch(e) {
      console.log(`✗ ${cls} failed:`, e);
    }
  }

  fs.writeFileSync(
    "data/classes/classes.json",
    JSON.stringify(allClasses, null, 2)
  );

  console.log("\nClasses saved to data/classes/classes.json");
}

main();
