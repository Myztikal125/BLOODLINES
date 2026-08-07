import { createQuestDesign } from "./questArchitect";

async function main() {
  const quest = await createQuestDesign(
`Ashenvale contains corrupted magic.
The Forgotten Kin seeks ancient bloodline power.
The Green Wardens fight to restore the forest.`
  );

  console.log(quest);
}

main();
