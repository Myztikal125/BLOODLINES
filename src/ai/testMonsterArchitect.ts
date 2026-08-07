import { createMonsterDesign } from "./monsterArchitect";

async function main() {
  const monster = await createMonsterDesign(
`Ashenvale is corrupted by ancient magic.
The forest contains forgotten ruins and dangerous creatures.`
  );

  console.log(monster);
}

main();
