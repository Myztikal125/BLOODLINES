import { reviewDesign } from "./leadDesigner";

async function main() {
  const result = await reviewDesign(
    "research/bloodlines_wizard_magic_system_research.md"
  );

  console.log(result);
}

main();
