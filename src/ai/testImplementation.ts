import { runAuditedImplementation } from "./auditedImplementationAssistant";

function getArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function getSystemRequest(): string {
  return getArgument("--system") ?? process.argv.slice(2).filter(argument => !argument.startsWith("--")).join(" ") ?? "Review the approved implementation requirements.";
}

async function main() {
  const system = getSystemRequest();
  const context = getArgument("--context") ?? `Inspect the repository for the '${system}' system. Search the relevant Rules Bible entries, runtime rules, existing implementation, and tests. Determine whether the approved rules are already implemented, ready for implementation, or blocked by a missing human decision. Do not invent mechanics.`;
  const dataFile = getArgument("--data") ?? "data/rules/compiledRules.json";
  const engineFile = getArgument("--engine") ?? "engine";
  const result = await runAuditedImplementation({ system, context, dataFile, enginePath: engineFile });

  console.log(result.report);
  console.log(`\nReport Auditor verdict: ${result.auditVerdict} (revision ${result.auditRevision})`);
  if (result.humanActionRequired) {
    console.log("HUMAN_ACTION_REQUIRED — automatic correction has been stopped.");
    process.exitCode = 3;
  } else if (result.applied) {
    console.log("\nImplementation Assistant completed the authorized repository patch.");
  } else {
    console.log("\nImplementation Assistant did not patch the repository.");
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
