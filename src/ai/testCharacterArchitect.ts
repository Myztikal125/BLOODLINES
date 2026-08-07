import { createCharacterDesign } from "./characterArchitect";

async function main() {
  const character = await createCharacterDesign(
`Ashenvale is an ancient magical forest.
Bloodlines grant inherited supernatural powers.
Magic and ancient civilizations shape the world.`
  );

  console.log(character);
}

main();
