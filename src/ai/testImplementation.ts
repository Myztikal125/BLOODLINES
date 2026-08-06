import { implementDesign } from "./implementationAssistant";

async function main() {

  const result = await implementDesign(
    "data/classes/wizard.json",
    "src/engine/characterFactory.ts"
  );

  console.log(result);

}

main();
