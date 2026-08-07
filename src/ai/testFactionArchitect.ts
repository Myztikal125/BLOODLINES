import { createFactionDesign } from "./factionArchitect";

async function main() {
  const faction = await createFactionDesign(
`Ashenvale contains ancient ruins, corrupted magic,
lost bloodlines, and factions fighting over forgotten power.`
  );

  console.log(faction);
}

main();
