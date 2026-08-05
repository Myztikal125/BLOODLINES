import { createCheckpoint } from "./scribe";

async function main() {
  const result = await createCheckpoint(
    "Added Researcher Assistant, Lead Designer Assistant, wizard research workflow, and Design Bible system."
  );

  console.log(result);
}

main();
