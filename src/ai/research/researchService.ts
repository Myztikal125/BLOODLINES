import type { ResearchQuery, ResearchReport, ResearchSourceType, ResearchSourceStatus } from "./researchTypes";
import { searchSource } from "./sources";
import { dedupeSources, filterResearchSources, rankSources, lookbackStart } from "./researchUtils";

const DEFAULT_SOURCES: ResearchSourceType[] = ["reddit", "github", "hackernews", "web"];

export async function researchTopic(query: ResearchQuery): Promise<ResearchReport> {
  const days = Math.min(90, Math.max(1, query.days ?? 30));
  const maxResults = Math.min(100, Math.max(1, query.maxResults ?? 20));
  const sources = query.sources?.length ? query.sources : DEFAULT_SOURCES;
  const end = new Date();
  const start = lookbackStart(days, end);
  const allSources = [] as Awaited<ReturnType<typeof searchSource>>;
  const sourceStatus = {} as ResearchReport["sourceStatus"];

  for (const source of DEFAULT_SOURCES) sourceStatus[source] = "skipped";

  for (const source of sources) {
    try {
      const results = await searchSource(source, query.topic, { days, maxResults });
      allSources.push(...results);
      sourceStatus[source] = results.length ? "ok" : "no-results";
    } catch (error) {
      sourceStatus[source] = classifySourceError(error);
      console.warn(`Research source ${source} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Freshness is a hard gate: retrievedAt never substitutes for publishedAt.
  // Relevance is applied after freshness so stale but highly-engaged results
  // cannot survive merely because they rank well.
  const deduped = dedupeSources(allSources);
  const freshRelevant = filterResearchSources(deduped, query.topic, start, end);
  const ranked = rankSources(freshRelevant).slice(0, maxResults);

  const findings = ranked.map(source => ({
    statement: source.title,
    sources: [source],
    confidence: source.type === "github" ? "high" as const : "medium" as const,
    uncertainty: source.type === "web" ? "Search result metadata was available; page content has not yet been independently verified." : undefined
  }));

  return {
    topic: query.topic,
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    findings,
    sources: ranked,
    sourceStatus,
    generatedAt: new Date().toISOString()
  };
}

function classifySourceError(error: unknown): ResearchSourceStatus {
  const message = error instanceof Error ? error.message : String(error);
  const status = message.match(/(?:failed:|status\s+)(\d{3})/i)?.[1];

  if (status === "401" || status === "403") return "auth-failed";
  if (status === "429") return "rate-limited";
  if (status && /^5\d\d$/.test(status)) return "unreachable";
  if (/timeout|timed out|abort/i.test(message)) return "unreachable";
  return "error";
}
