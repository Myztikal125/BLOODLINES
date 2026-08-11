import type { ResearchSource } from "./researchTypes";

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
