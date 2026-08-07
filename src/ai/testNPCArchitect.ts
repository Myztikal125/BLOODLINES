import { createNPC } from "./npcArchitect";

async function main() {
  const npc = await createNPC(
`Ashenvale is an ancient forest filled with forgotten ruins,
lost civilizations, and dormant magic.`
  );

  console.log(npc);
}

main();
