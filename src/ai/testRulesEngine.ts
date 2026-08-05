import { generateRules } from "./rulesEngine";

async function main() {

  const result = await generateRules(
    "Create the data specification for the Shadowveil bloodline as data/bloodlines/shadowveil.json"
  );

  console.log(result);
}

main();
