import { reviewDesign } from "./leadDesigner";

async function main() {
  const result = await reviewDesign(
    "core_combat_system_design_for_bloodlines_rpg_research_initiative_action_economy_attacks_defenses_damage_status_effects_tactical_choices_monster_ai_and_how_to_balance_combat_depth_with_accessibility_.md"
  );

  console.log(result);
}

main();
