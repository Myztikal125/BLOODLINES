import type { ResearchFinding, ResearchReport, ResearchSource, ResearchSourceType } from "./researchTypes";

export interface ResearchCluster {
  theme: string;
  evidence: ResearchSource[];
  sourceTypes: ResearchSourceType[];
  crossSource: boolean;
  confidence: "high" | "medium" | "low";
  uncertainty?: string;
}

export interface ResearchSynthesis {
  topic: string;
  windowStart: string;
  windowEnd: string;
  summary: string;
  keyPatterns: string[];
  clusters: ResearchCluster[];
  limitations: string[];
  sourceStatus: ResearchReport["sourceStatus"];
}

const STOP_WORDS = new Set([
  "about", "after", "again", "being", "could", "first", "from", "have", "into",
  "more", "other", "over", "that", "their", "there", "these", "they", "this",
  "what", "when", "where", "which", "while", "with", "would", "your", "than",
  "then", "them", "were", "will", "using", "used", "users", "game", "games"
]);

export function synthesizeResearch(report: ResearchReport): ResearchSynthesis {
  const clusters = clusterSources(report.sources);
  const keyPatterns = clusters.slice(0, 5).map(cluster =>
    `${cluster.theme} (${cluster.evidence.length} source${cluster.evidence.length === 1 ? "" : "s"}${cluster.crossSource ? ", cross-source" : ""})`
  );

  const successfulSources = Object.entries(report.sourceStatus)
    .filter(([, status]) => status === "ok" || status === "no-results")
    .map(([source]) => source);
  const failedSources = Object.entries(report.sourceStatus)
    .filter(([, status]) => !["ok", "no-results", "skipped"].includes(status))
    .map(([source, status]) => `${source} (${status})`);
  const noResultSources = Object.entries(report.sourceStatus)
    .filter(([, status]) => status === "no-results")
    .map(([source]) => source);

  const limitations: string[] = [];
  if (failedSources.length) limitations.push(`Partial coverage: ${failedSources.join(", ")}. A failed source is not evidence that the topic was absent there.`);
  if (noResultSources.length) limitations.push(`No matching evidence was returned by: ${noResultSources.join(", ")}.`);
  if (!report.sources.length) limitations.push("No source evidence was available for synthesis.");

  const summary = buildSummary(report, clusters, successfulSources);

  return {
    topic: report.topic,
    windowStart: report.windowStart,
    windowEnd: report.windowEnd,
    summary,
    keyPatterns,
    clusters,
    limitations,
    sourceStatus: report.sourceStatus
  };
}

export function toResearchFindings(synthesis: ResearchSynthesis): ResearchFinding[] {
  return synthesis.clusters.map(cluster => ({
    statement: cluster.theme,
    sources: cluster.evidence,
    confidence: cluster.confidence,
    uncertainty: cluster.uncertainty
  }));
}

function clusterSources(sources: ResearchSource[]): ResearchCluster[] {
  const buckets = new Map<string, ResearchSource[]>();
  for (const source of sources) {
    const text = `${source.title} ${source.excerpt ?? ""}`.toLowerCase();
    const tokens = tokenize(text).slice(0, 6);
    const key = tokens.slice(0, 3).join(" ") || source.type;
    const existing = buckets.get(key) ?? [];
    existing.push(source);
    buckets.set(key, existing);
  }

  return [...buckets.entries()]
    .map(([theme, evidence]) => {
      const sourceTypes = [...new Set(evidence.map(source => source.type))];
      const crossSource = sourceTypes.length > 1;
      const confidence = crossSource ? "high" : evidence.length >= 3 ? "medium" : "low";
      return {
        theme: humanizeTheme(theme, evidence[0]),
        evidence,
        sourceTypes,
        crossSource,
        confidence,
        uncertainty: crossSource ? undefined : "Single-source evidence; corroboration from another source type was not found in this report."
      };
    })
    .sort((a, b) => {
      const confidenceRank = { high: 3, medium: 2, low: 1 };
      return confidenceRank[b.confidence] - confidenceRank[a.confidence] || b.evidence.length - a.evidence.length;
    });
}

function tokenize(text: string): string[] {
  return [...new Set((text.match(/[a-z0-9][a-z0-9'-]{2,}/g) ?? []).filter(token => !STOP_WORDS.has(token)))];
}

function humanizeTheme(theme: string, source: ResearchSource): string {
  if (theme) return theme.replace(/\b\w/g, char => char.toUpperCase());
  return source.title;
}

function buildSummary(report: ResearchReport, clusters: ResearchCluster[], successfulSources: string[]): string {
  if (!report.sources.length) return `No usable evidence was found for "${report.topic}" during the requested window.`;
  const corroborated = clusters.filter(cluster => cluster.crossSource).length;
  const coverage = successfulSources.length ? `Evidence came from ${successfulSources.length} source channels.` : "Source coverage was limited.";
  return `The research found ${report.sources.length} relevant source item${report.sources.length === 1 ? "" : "s"} for "${report.topic}". ${coverage} ${corroborated} theme${corroborated === 1 ? " is" : "s are"} corroborated across multiple source types.`;
}
