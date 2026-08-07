import { reviewDesign } from "./leadDesigner";
import fs from "fs";
import path from "path";

async function main() {
  const files = [
    "research/wizard_class_design_for_bloodlines_rpg_research_spell_progression_spell_slots_ar.md",
    "research/fighter_class_design_for_bloodlines_rpg_research_action_surge_fighting_styles_ma.md",
    "research/rogue_class_design_for_bloodlines_rpg_research_sneak_attack_cunning_action_thiev.md",
    "research/cleric_class_design_for_bloodlines_rpg_research_divine_domains_channel_divinity_.md",
    "research/ranger_class_design_for_bloodlines_rpg_research_favored_enemy_natural_explorer_r.md"
  ];

  for (const file of files) {
    const className = file.split("/")[1].split("_class")[0];
    console.log(`\nDesigning: ${className}...`);
    const decision = await reviewDesign(file);
    fs.writeFileSync(
      `docs/design_${className}.md`,
      decision
    );
    console.log(`Design saved: docs/design_${className}.md`);
  }

  console.log("\nAll class designs complete!");
}

main();
