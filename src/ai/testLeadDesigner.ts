import { reviewDesign } from "./leadDesigner";

async function main() {
  const result = await reviewDesign(
    "wizard_class_progression_and_spell_systems_for_bloodlines.md"
  );

  console.log(result);
}

main();
