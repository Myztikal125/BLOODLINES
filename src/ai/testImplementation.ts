import { implementDesign } from "./implementationAssistant";

function getArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function getSystemRequest(): string {
  return getArgument("--system") ?? process.argv.slice(2).filter(argument => !argument.startsWith("--")).join(" ") ?? "Review the approved implementation requirements.";
}

async function main() {
  const system = getSystemRequest();
  const context = getArgument("--context") ?? `Inspect the repository for the '${system}' system. Search the Rules Bible, runtime implementation, and tests. Implement only missing approved requirements. Do not invent mechanics, reopen design approval, or use Jest.`;
  const dataFile = getArgument("--data") ?? "data/rules/compiledRules.json";
  const enginePath = getArgument("--engine") ?? "engine";
  const result = await implementDesign(dataFile, enginePath, { system, context });
  console.log(result.report);
  if (result.applied) {
    console.log("\nDirect Implementation Executor completed the approved implementation path.");
    return;
  }
  console.error("\nDirect Implementation Executor did not complete the implementation.");
  process.exitCode = 2;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
