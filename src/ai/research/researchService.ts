import type { ResearchQuery, ResearchReport, ResearchSourceType } from "./researchTypes";
import { searchSource } from "./sources";
import { dedupeSources, rankSources, lookbackStart } from "./researchUtils";

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
      sourceStatus[source] = "error";
      console.warn(`Research source ${source} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const ranked = rankSources(dedupeSources(allSources)).slice(0, maxResults);
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
