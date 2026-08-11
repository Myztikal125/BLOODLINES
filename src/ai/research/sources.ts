import type { ResearchSource, ResearchSourceType } from "./researchTypes";
import { lookbackStart, withinLookback } from "./researchUtils";

interface SearchOptions { days: number; maxResults: number; signal?: AbortSignal; }

export async function searchReddit(topic: string, options: SearchOptions): Promise<ResearchSource[]> {
  const limit = Math.min(options.maxResults, 100);
  const now = new Date();

  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&sort=new&t=month&limit=${limit}`;
    const response = await fetch(url, { headers: { "User-Agent": "BLOODLINES-research/1.0" }, signal: options.signal });
    if (response.ok) {
      const data = await response.json() as { data?: { children?: Array<{ data?: Record<string, unknown> }> } };
      return parseRedditJson(data, options, now);
    }
    if (response.status !== 403 && response.status !== 429) {
      throw new Error(`Reddit search failed: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error && !/Reddit search failed: (403|429)/.test(error.message)) throw error;
  }

  // Reddit frequently blocks unauthenticated API requests. Fall back to a
  // keyless web search restricted to Reddit so the source remains usable.
  return searchRedditViaWeb(topic, options, now);
}

function parseRedditJson(
  data: { data?: { children?: Array<{ data?: Record<string, unknown> }> } },
  options: SearchOptions,
  now: Date
): ResearchSource[] {
  const start = lookbackStart(options.days, now);
  return (data.data?.children ?? []).flatMap(child => {
    const item = child.data ?? {};
    const created = typeof item.created_utc === "number" ? new Date(item.created_utc * 1000).toISOString() : undefined;
    if (!withinLookback(created, start, now)) return [];
    return [{
      type: "reddit" as const,
      title: typeof item.title === "string" ? item.title : "Reddit result",
      url: typeof item.permalink === "string" ? `https://www.reddit.com${item.permalink}` : "",
      publishedAt: created,
      author: typeof item.author === "string" ? item.author : undefined,
      engagement: typeof item.score === "number" ? item.score : undefined,
      excerpt: typeof item.selftext === "string" ? item.selftext.slice(0, 1000) : undefined,
      retrievedAt: now.toISOString()
    }];
  }).filter(source => Boolean(source.url));
}

async function searchRedditViaWeb(topic: string, options: SearchOptions, now: Date): Promise<ResearchSource[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`site:reddit.com ${topic}`)}`;
  const response = await fetch(url, { headers: { "User-Agent": "BLOODLINES-research/1.0" }, signal: options.signal });
  if (!response.ok) throw new Error(`Reddit fallback search failed: ${response.status}`);
  const html = await response.text();
  const results = parseDuckDuckGoResults(html, options.maxResults, now);
  return results.filter(source => /(^|\.)reddit\.com$/i.test(new URL(source.url).hostname)).map(source => ({ ...source, type: "reddit" as const }));
}

export async function searchHackerNews(topic: string, options: SearchOptions): Promise<ResearchSource[]> {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(topic)}&tags=story&hitsPerPage=${Math.min(options.maxResults, 100)}`;
  const response = await fetch(url, { signal: options.signal });
  if (!response.ok) throw new Error(`Hacker News search failed: ${response.status}`);
  const data = await response.json() as { hits?: Array<Record<string, unknown>> };
  const start = lookbackStart(options.days);
  const now = new Date();
  return (data.hits ?? []).flatMap(item => {
    const created = typeof item.created_at === "string" ? item.created_at : undefined;
    if (!withinLookback(created, start, now)) return [];
    const objectId = typeof item.objectID === "string" ? item.objectID : undefined;
    return objectId ? [{
      type: "hackernews" as const,
      title: typeof item.title === "string" ? item.title : "Hacker News result",
      url: `https://news.ycombinator.com/item?id=${objectId}`,
      publishedAt: created,
      author: typeof item.author === "string" ? item.author : undefined,
      engagement: typeof item.points === "number" ? item.points : undefined,
      excerpt: typeof item.story_text === "string" ? item.story_text.slice(0, 1000) : undefined,
      retrievedAt: now.toISOString()
    }] : [];
  });
}

export async function searchGitHub(topic: string, options: SearchOptions): Promise<ResearchSource[]> {
  // The GitHub Issues search API supports created/updated qualifiers, not pushed.
  const query = `${topic} updated:>=${formatDate(lookbackStart(options.days))}`;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "BLOODLINES-research/1.0" };
  if (process.env.GITHUB_TOKEN?.trim()) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN.trim()}`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=${Math.min(options.maxResults, 100)}`;
  const response = await fetch(url, { headers, signal: options.signal });
  if (!response.ok) throw new Error(`GitHub search failed: ${response.status}`);
  const data = await response.json() as { items?: Array<Record<string, unknown>> };
  const now = new Date();
  const start = lookbackStart(options.days);
  return (data.items ?? []).flatMap(item => {
    const updated = typeof item.updated_at === "string" ? item.updated_at : undefined;
    if (!withinLookback(updated, start, now)) return [];
    const htmlUrl = typeof item.html_url === "string" ? item.html_url : "";
    return htmlUrl ? [{
      type: "github" as const,
      title: typeof item.title === "string" ? item.title : "GitHub result",
      url: htmlUrl,
      publishedAt: typeof item.created_at === "string" ? item.created_at : updated,
      author: typeof item.user === "object" && item.user && typeof (item.user as Record<string, unknown>).login === "string" ? (item.user as Record<string, unknown>).login as string : undefined,
      engagement: typeof item.comments === "number" ? item.comments : undefined,
      excerpt: typeof item.body === "string" ? item.body.slice(0, 1000) : undefined,
      retrievedAt: now.toISOString()
    }] : [];
  });
}

export async function searchWeb(topic: string, options: SearchOptions): Promise<ResearchSource[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(topic)}`;
  const response = await fetch(url, { headers: { "User-Agent": "BLOODLINES-research/1.0" }, signal: options.signal });
  if (!response.ok) throw new Error(`Web search failed: ${response.status}`);
  const html = await response.text();
  return parseDuckDuckGoResults(html, options.maxResults, new Date());
}

function parseDuckDuckGoResults(html: string, maxResults: number, now: Date): ResearchSource[] {
  const sources: ResearchSource[] = [];
  const patterns = [
    /<a[^>]+class=["']result__a["'][^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    /<a[^>]+href=["']([^"']+)["'][^>]*class=["'][^"']*result__a[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      if (sources.length >= maxResults) break;
      const rawUrl = decodeHtml(match[1]);
      const title = decodeHtml(stripTags(match[2]));
      if (!/^https?:\/\//i.test(rawUrl)) continue;
      if (sources.some(source => source.url === rawUrl)) continue;
      sources.push({ type: "web", title, url: rawUrl, retrievedAt: now.toISOString() });
    }
    if (sources.length >= maxResults) break;
  }
  return sources;
}

export async function searchSource(type: ResearchSourceType, topic: string, options: SearchOptions): Promise<ResearchSource[]> {
  switch (type) {
    case "reddit": return searchReddit(topic, options);
    case "github": return searchGitHub(topic, options);
    case "hackernews": return searchHackerNews(topic, options);
    case "web": return searchWeb(topic, options);
  }
}

function formatDate(date: Date): string { return date.toISOString().slice(0, 10); }
function stripTags(value: string): string { return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); }
function decodeHtml(value: string): string { return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">"); }
