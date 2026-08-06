import { compileRules } from "./rulesCompiler";

async function main() {

  const result = await compileRules(
    "docs/DESIGN_BIBLE.md"
  );

  console.log(result);

}

main();
