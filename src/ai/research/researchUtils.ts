import type { ResearchSource } from "./researchTypes";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "is",
  "it", "of", "on", "or", "that", "the", "to", "with", "what", "when", "where",
  "who", "why", "how", "this", "these", "those", "about"
]);

export function lookbackStart(days: number, end = new Date()): Date {
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - Math.max(1, days));
  return start;
}

export function withinLookback(date: string | undefined, start: Date, end = new Date()): boolean {
  if (!date) return false;
  const parsed = new Date(date);
  return !Number.isNaN(parsed.getTime()) && parsed >= start && parsed <= end;
}

/**
 * Keep only evidence whose publication date can be proven to fall inside the
 * requested window and whose content has meaningful overlap with the topic.
 * Retrieval time is deliberately ignored for freshness decisions.
 */
export function filterResearchSources(
  sources: ResearchSource[],
  topic: string,
  start: Date,
  end: Date,
  minRelevance = 0.2
): ResearchSource[] {
  const topicTerms = tokenize(topic);
  if (topicTerms.length === 0) return [];

  return sources.filter(source => {
    if (!withinLookback(source.publishedAt, start, end)) return false;
    return relevanceScore(source, topicTerms) >= minRelevance;
  });
}

export function relevanceScore(source: ResearchSource, topicTerms = tokenize(source.title)): number {
  if (topicTerms.length === 0) return 0;

  const text = normalize(`${source.title} ${source.excerpt ?? ""}`);
  const matched = topicTerms.filter(term => text.includes(term)).length;
  const termCoverage = matched / topicTerms.length;

  const titleText = normalize(source.title);
  const titleMatches = topicTerms.filter(term => titleText.includes(term)).length;
  const titleCoverage = titleMatches / topicTerms.length;

  // Reward phrases that preserve the meaning of multi-word topics without
  // requiring exact title matches. This keeps "AI RPG game development"
  // relevant to "AI-assisted RPG development" while rejecting incidental hits.
  const phraseBonus = topicTerms.length > 1 && matched >= 2 ? 0.15 : 0;

  return Math.min(1, termCoverage * 0.55 + titleCoverage * 0.3 + phraseBonus);
}

export function dedupeSources(sources: ResearchSource[]): ResearchSource[] {
  const seen = new Set<string>();
  return sources.filter(source => {
    const key = source.url.trim().replace(/#.*$/, "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function rankSources(sources: ResearchSource[]): ResearchSource[] {
  return [...sources].sort((a, b) => score(b) - score(a));
}

function score(source: ResearchSource): number {
  const engagement = Math.min(20, Math.log10(Math.max(1, source.engagement ?? 0) + 1) * 5);
  const freshness = source.publishedAt ? Math.max(0, 10 - ageDays(source.publishedAt)) : 0;
  const sourceWeight = source.type === "github" || source.type === "reddit" ? 5 : 3;
  return engagement + freshness + sourceWeight;
}

function ageDays(value: string): number {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return 999;
  return Math.max(0, (Date.now() - time) / 86_400_000);
}

function tokenize(value: string): string[] {
  return [...new Set(
    normalize(value)
      .split(/\s+/)
      .filter(term => term.length >= 2 && !STOP_WORDS.has(term))
  )];
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim();
}
