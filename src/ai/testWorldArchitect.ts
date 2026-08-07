import { createWorldDesign } from "./worldArchitect";

async function main() {
  const world = await createWorldDesign(
`Ashenvale is an ancient magical forest.
Forgotten civilizations, bloodlines, and corrupted magic shape the region.`
  );

  console.log(world);
}

main();
