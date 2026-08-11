import { describe, expect, it } from "vitest";
import { synthesizeResearch, toResearchFindings } from "../src/ai/research/researchSynthesis";
import type { ResearchReport } from "../src/ai/research/researchTypes";

const baseReport = (overrides: Partial<ResearchReport> = {}): ResearchReport => ({
  topic: "AI RPG game development",
  windowStart: "2026-07-12T00:00:00.000Z",
  windowEnd: "2026-08-11T00:00:00.000Z",
  findings: [],
  sources: [],
  sourceStatus: { reddit: "no-results", github: "ok", hackernews: "no-results", web: "no-results" },
  generatedAt: "2026-08-11T00:00:00.000Z",
  ...overrides
});

describe("research synthesis", () => {
  it("detects cross-source corroboration", () => {
    const report = baseReport({
      sources: [
        { type: "github", title: "AI RPG tools improve developer workflow", url: "https://github.com/a", retrievedAt: "2026-08-11T00:00:00.000Z" },
        { type: "reddit", title: "AI RPG tools improve developer workflow", url: "https://reddit.com/a", retrievedAt: "2026-08-11T00:00:00.000Z" }
      ],
      sourceStatus: { reddit: "ok", github: "ok", hackernews: "no-results", web: "no-results" }
    });

    const synthesis = synthesizeResearch(report);
    expect(synthesis.clusters).toHaveLength(1);
    expect(synthesis.clusters[0].crossSource).toBe(true);
    expect(synthesis.clusters[0].confidence).toBe("high");
    expect(synthesis.limitations).toHaveLength(2);
    expect(toResearchFindings(synthesis)[0].sources).toHaveLength(2);
  });

  it("does not treat failed sources as no-results", () => {
    const report = baseReport({
      sourceStatus: { reddit: "auth-failed", github: "ok", hackernews: "no-results", web: "unreachable" },
      sources: [{ type: "github", title: "AI RPG development", url: "https://github.com/a", retrievedAt: "2026-08-11T00:00:00.000Z" }]
    });

    const synthesis = synthesizeResearch(report);
    expect(synthesis.limitations.some(item => item.includes("auth-failed"))).toBe(true);
    expect(synthesis.limitations.some(item => item.includes("unreachable"))).toBe(true);
    expect(synthesis.limitations.some(item => item.includes("failed source"))).toBe(true);
  });

  it("returns an honest empty report when no evidence exists", () => {
    const synthesis = synthesizeResearch(baseReport());
    expect(synthesis.summary).toContain("No usable evidence");
    expect(synthesis.clusters).toHaveLength(0);
    expect(synthesis.limitations).toContain("No source evidence was available for synthesis.");
  });
});
