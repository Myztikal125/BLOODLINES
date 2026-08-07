import { research } from "./researcher";

async function main() {
  const classes = [
    "Wizard class design for BLOODLINES RPG. Research spell progression, spell slots, arcane traditions, cantrips, ritual casting, spellbook mechanics, intelligence-based casting, and how wizards interact with bloodline powers.",
    "Fighter class design for BLOODLINES RPG. Research action surge, fighting styles, martial archetypes, second wind, ability score improvements, weapon mastery, and how fighters interact with bloodline powers.",
    "Rogue class design for BLOODLINES RPG. Research sneak attack, cunning action, thieves tools, roguish archetypes, evasion, uncanny dodge, and how rogues interact with bloodline powers.",
    "Cleric class design for BLOODLINES RPG. Research divine domains, channel divinity, spell preparation, turn undead, divine intervention, and how clerics interact with bloodline powers.",
    "Ranger class design for BLOODLINES RPG. Research favored enemy, natural explorer, ranger archetypes, spellcasting, animal companion, and how rangers interact with bloodline powers."
  ];

  for (const topic of classes) {
    console.log(`\nResearching: ${topic.substring(0, 50)}...`);
    await research(topic);
  }

  console.log("\nAll class research complete!");
}

main();
