import { reviewDesign } from "./leadDesigner";

async function main() {
  const result = await reviewDesign(
    "research/rules/bloodline_system_design_for_bloodlines_rpg_research_inherited_powers_supernatural_ancestry_progression_systems_awakening_mechanics_mutations_curses_blessings_class_interactions_and_how_bloodlines_can_affect_character_identity_and_storytelling_.md"
  );

  console.log(result);
}

main();
