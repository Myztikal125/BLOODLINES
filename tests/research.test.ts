import { describe, expect, it } from "vitest";
import { dedupeSources, lookbackStart, rankSources, withinLookback } from "../src/ai/research/researchUtils";

const source = (url: string, overrides: Record<string, unknown> = {}) => ({
  type: "reddit" as const,
  title: "test",
  url,
  retrievedAt: new Date().toISOString(),
  ...overrides
});

describe("research utilities", () => {
  it("creates a 30-day lookback window", () => {
    const end = new Date("2026-08-11T00:00:00Z");
    expect(lookbackStart(30, end).toISOString()).toBe("2026-07-12T00:00:00.000Z");
  });

  it("accepts dates inside the research window and rejects older dates", () => {
    const end = new Date("2026-08-11T00:00:00Z");
    const start = lookbackStart(30, end);
    expect(withinLookback("2026-08-01T00:00:00Z", start, end)).toBe(true);
    expect(withinLookback("2026-06-01T00:00:00Z", start, end)).toBe(false);
  });

  it("deduplicates URLs while preserving the first result", () => {
    const results = dedupeSources([
      source("https://example.com/a#comments"),
      source("https://example.com/a"),
      source("https://example.com/b")
    ]);
    expect(results.map(item => item.url)).toEqual(["https://example.com/a#comments", "https://example.com/b"]);
  });

  it("ranks fresh high-engagement sources ahead of weaker sources", () => {
    const ranked = rankSources([
      source("https://example.com/old", { publishedAt: "2026-01-01T00:00:00Z", engagement: 1 }),
      source("https://example.com/new", { publishedAt: "2026-08-10T00:00:00Z", engagement: 1000 })
    ]);
    expect(ranked[0].url).toBe("https://example.com/new");
  });
});
