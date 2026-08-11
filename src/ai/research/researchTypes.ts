export type ResearchSourceType = "web" | "reddit" | "github" | "hackernews";

export type ResearchSourceStatus =
  | "ok"
  | "no-results"
  | "error"
  | "rate-limited"
  | "auth-failed"
  | "unreachable"
  | "skipped";

export interface ResearchSource {
  type: ResearchSourceType;
  title: string;
  url: string;
  publishedAt?: string;
  author?: string;
  engagement?: number;
  excerpt?: string;
  retrievedAt: string;
}

export interface ResearchFinding {
  statement: string;
  sources: ResearchSource[];
  confidence: "high" | "medium" | "low";
  uncertainty?: string;
}

export interface ResearchQuery {
  topic: string;
  days?: number;
  maxResults?: number;
  sources?: ResearchSourceType[];
}

export interface ResearchReport {
  topic: string;
  windowStart: string;
  windowEnd: string;
  findings: ResearchFinding[];
  sources: ResearchSource[];
  sourceStatus: Record<ResearchSourceType, ResearchSourceStatus>;
  generatedAt: string;
}
