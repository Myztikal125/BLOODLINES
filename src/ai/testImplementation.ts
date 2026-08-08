import { implementDesign } from "./implementationAssistant";

async function main() {
  const result = await implementDesign(
    "data/rules/compiledRules.json",
    "engine/combat/attack.ts",
    {
      system: "Advantage and Disadvantage",
      context:
        "Determine whether the approved Advantage and Disadvantage system is sufficiently defined and implemented in the current combat engine. Inspect the repository for existing attack-roll and combat implementations. Do not invent missing mechanics."
    }
  );

  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
