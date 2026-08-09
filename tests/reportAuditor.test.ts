import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import os from "os";
import path from "path";

const askAIMock = vi.fn();

vi.mock("../src/ai/aiClient", () => ({
  askAI: askAIMock,
}));

import { ReportAuditor, type AssistantReport } from "../src/ai/reportAuditor";

const completeReport = `# Implementation Status\nThe system is implemented.\n# Approved Requirements\nAll approved requirements are addressed.\n# Repository Findings\nRepository evidence supports the implementation.\n# Human Decisions Required\nNone identified.\n# Files Affected\nNone.\n# Required Changes\nNone.\n# Tests\nTests cover the implementation.\n# Risks\nNone identified.\n# Verification\nVerification is complete.`;

const baseReport: AssistantReport = {
  assistant: "Implementation Assistant",
  system: "Action Economy",
  report: completeReport,
  revision: 1,
};

const rules = `# Action Economy\nOne Action, one Bonus Action, one Reaction, turn reset, stamina resource, action consumption, bonus consumption, reaction reset, and no extra baseline slots.`;

beforeEach(() => {
  askAIMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Report Auditor", () => {
  it("sends a rejected report back for correction and approves the corrected report", async () => {
    askAIMock
      .mockResolvedValueOnce(`VERDICT: REVISION_REQUIRED\nPROBLEMS:\n- Turn reset is not demonstrated.\nREQUIRED_CORRECTIONS:\n- Verify the turn reset against runtime evidence.\nFEEDBACK:\nReinspect the runtime and revise the report.`)
      .mockResolvedValueOnce(`VERDICT: APPROVED\nPROBLEMS:\n- None.\nREQUIRED_CORRECTIONS:\n- None.\nFEEDBACK:\nThe corrected report is supported by the rules and evidence.`);

    const historyPath = path.join(os.tmpdir(), `bloodlines-report-auditor-${process.pid}-revision.json`);
    const auditor = new ReportAuditor({ maxAutomaticRevisions: 3, historyPath });
    const result = await auditor.reviewWithCorrections(
      baseReport,
      rules,
      "engine/combat/actionEconomy.ts contains ActionEconomyState and startTurn().",
      async (feedback, revision) => ({ ...baseReport, revision, report: `${completeReport}\n\n# Auditor Feedback\n${feedback}` }),
    );

    expect(result.audit.verdict).toBe("APPROVED");
    expect(result.finalReport.revision).toBe(2);
    expect(askAIMock).toHaveBeenCalledTimes(2);
  });

  it("escalates when an assistant repeats a rejected report", async () => {
    askAIMock.mockResolvedValue(`VERDICT: REVISION_REQUIRED\nPROBLEMS:\n- Missing runtime evidence.\nREQUIRED_CORRECTIONS:\n- Inspect the runtime integration.\nFEEDBACK:\nCorrect the missing evidence.`);

    const historyPath = path.join(os.tmpdir(), `bloodlines-report-auditor-${process.pid}-repeat.json`);
    const auditor = new ReportAuditor({ maxAutomaticRevisions: 3, historyPath });
    const result = await auditor.reviewWithCorrections(
      baseReport,
      rules,
      "runtime evidence",
      async () => baseReport,
    );

    expect(result.audit.verdict).toBe("ESCALATE");
    expect(result.audit.humanActionRequired).toBe(true);
    expect(result.audit.problems.some(problem => problem.includes("meaningful progress"))).toBe(true);
  });
});
