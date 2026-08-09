import { buildRepositoryContext } from "./repositoryContext";
import { implementDesign } from "./implementationAssistant";
import { runAuditedImplementation } from "./auditedImplementationAssistant";
import { resolveLeadDesignerCase } from "./leadDesigner";

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

  if (result.auditVerdict === "ESCALATE") {
    const decision = await resolveLeadDesignerCase({
      system,
      problem: result.report,
      repositoryEvidence: buildRepositoryContext(`${system} ${context}`),
      assistantReport: result.report,
      auditorFeedback: result.report,
    });

    console.log(`\nLEAD DESIGNER DECISION ${decision.id}: ${decision.decision}`);
    console.log(decision.reasoning);
    console.log(`REQUIRED ACTION: ${decision.requiredAction}`);
    if (decision.requiredFiles.length) console.log(`REQUIRED FILES: ${decision.requiredFiles.join(", ")}`);
    if (decision.prohibitedChanges.length) console.log(`PROHIBITED CHANGES: ${decision.prohibitedChanges.join("; ")}`);

    if (decision.decision === "IMPLEMENT_REQUIRED" || decision.decision === "APPROVED_WITH_MODIFICATIONS") {
      const implementation = await implementDesign(dataFile, engineFile, {
        system,
        context: `${context}\n\nBINDING LEAD DESIGNER DECISION ${decision.id}\nDecision: ${decision.decision}\nRequired action: ${decision.requiredAction}\nRequired files: ${decision.requiredFiles.join(", ") || "none specified"}\nProhibited changes: ${decision.prohibitedChanges.join("; ") || "none specified"}\nVerification: ${decision.verification.join("; ") || "run the standard TypeScript and test verification"}\nReasoning: ${decision.reasoning}`.slice(0, 12000),
      });

      console.log(implementation.report);
      if (implementation.applied) {
        console.log("\nImplementation Assistant completed the Lead Designer's binding decision.");
        return;
      }

      console.error("\nLead Designer decision could not be executed safely. HUMAN_ACTION_REQUIRED.");
      process.exitCode = 3;
      return;
    }

    if (decision.decision === "NO_CHANGE_REQUIRED" || decision.decision === "APPROVED") {
      console.log("\nLead Designer determined that no repository implementation is required.");
      return;
    }

    console.error("\nHUMAN_ACTION_REQUIRED — Lead Designer did not authorize automatic implementation.");
    process.exitCode = 3;
    return;
  }

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
