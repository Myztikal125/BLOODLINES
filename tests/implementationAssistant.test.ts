import { describe, expect, it } from "vitest";
import { validateImplementationPlan } from "../src/ai/implementationAssistant";

const report = `# Implementation Status
Action Economy requires runtime integration.
# Approved Requirements
One Action, Bonus Action, Reaction, turn reset, stamina resource, and no extra baseline slots are required.
# Repository Findings
Action Economy state exists, but combat runtime integration is incomplete.
# Human Decisions Required
None identified.
# Files Affected
engine/combat/combatLoop.ts
# Required Changes
Integrate the existing action economy without inventing stamina costs.
# Tests
Existing Action Economy tests cover slot behavior.
# Risks
Avoid changing existing public APIs.
# Verification
Run TypeScript verification and tests.`;

describe("Implementation Assistant governance", () => {
  it("accepts the nine required report sections in order", () => {
    expect(() => validateImplementationPlan("Action Economy", report)).not.toThrow();
  });

  it("rejects reports that invent a numeric stamina cost", () => {
    expect(() => validateImplementationPlan("Action Economy", report.replace("stamina costs", "stamina cost of 5"))).toThrow();
  });
});
