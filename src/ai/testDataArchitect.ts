import fs from "fs";
import { architectData } from "./dataArchitect";

async function main() {

  const rules = fs.readFileSync(
    "research/compiled/wizard_rules.json",
    "utf8"
  );

  const result = await architectData(rules);

  console.log(result);

}

main();
