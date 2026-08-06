import { reviewDesign } from "./leadDesigner";

async function main() {
  const result = await reviewDesign(
    "research/bloodline_system_design_for_bloodlines_rpg_research_inherited_powers_supernatura.md"
  );

  console.log(result);
}

main();
