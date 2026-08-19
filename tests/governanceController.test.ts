import { describe, expect, it } from "vitest";
import { evaluateImplementationGate, getDesignAuthority, validateSuperpowersExecution } from "../src/ai/governanceController";

const RULES = "# Advantage and Disadvantage\n\nStatus: APPROVED\n- Roll two d20s and use the higher or lower result.";

function report(human: string, status = "The system is not fully implemented.", changes = "Implement the missing approved roll-state handling.") {
  return `Implementation Status\n${status}\n\nApproved Requirements\nThe Rules Bible requirements are approved.\n\nRepository Findings\nThe implementation is missing.\n\nHuman Decisions Required\n${human}\n\nFiles Affected\nengine/combat/attack.ts\n\nRequired Changes\n${changes}\n\nTests\nAdd focused tests.\n\nRisks\nRegression risk is limited to the affected roll path.\n\nVerification\nRun typecheck and tests.`;
}

describe("hard-coded BLOODLINES governance", () => {
  it("recognizes Advantage and Disadvantage as human-approved", () => {
    expect(getDesignAuthority("Advantage and Disadvantage")).toBe("APPROVED");
  });

  it("forces approved implementation work forward when no real design decision is present", () => {
    const result = evaluateImplementationGate("Advantage and Disadvantage", report("None required."), RULES);
    expect(result.gate).toBe("IMPLEMENT");
  });

  it("still escalates a genuinely unspecified design detail", () => {
    const result = evaluateImplementationGate(
      "Advantage and Disadvantage",
      report("Define the exact modifier and timing before implementation."),
      RULES,
    );
    expect(result.gate).toBe("ESCALATE");
  });

  it("rejects completion without a patch when implementation is incomplete", () => {
    expect(() => validateSuperpowersExecution(report("None required."), false, false)).toThrow(/cannot finish without a repository patch/i);
  });

  it("rejects completion when verification failed", () => {
    expect(() => validateSuperpowersExecution(report("None required."), true, false)).toThrow(/verification passes/i);
  });

  it("allows completion after a patch and successful verification", () => {
    expect(() => validateSuperpowersExecution(report("None required."), true, true)).not.toThrow();
  });
});
