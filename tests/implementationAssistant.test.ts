import { describe, expect, it } from "vitest";
import { validateImplementationPlan } from "../src/ai/implementationAssistant";
import { createDesignProposal } from "../src/ai/leadDesigner";

const report = `# Implementation Status
Action Economy requires runtime integration.
# Approved Requirements
One Action, Bonus Action, Reaction, turn reset, stamina resource, action consumption, bonus action consumption, reaction reset, and no extra baseline slots are required. A character cannot gain an extra action from stamina.
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
    expect(() => validateImplementationPlan("Action Economy", report.replace("stamina resource", "stamina cost of 5"))).toThrow();
  });

  it("creates assistant design proposals without treating them as approvals", () => {
    const proposal = createDesignProposal({
      assistant: "Combat Assistant",
      system: "Action Economy",
      proposal: "Add an event-driven reaction trigger layer.",
      rationale: "The existing reaction slot can support future approved triggers.",
    });
    expect(proposal.id).toMatch(/^DP-/);
    expect(proposal.status).toBe("PROPOSED");
    expect(proposal.assistant).toBe("Combat Assistant");
  });
});
