export type MemoryType = "fact" | "event" | "relationship" | "belief" | "goal" | "observation";

export interface NpcMemory {
  id: string;
  npcId: string;
  type: MemoryType;
  content: string;
  importance: number;
  createdAt: number;
  lastAccessedAt?: number;
  accessCount: number;
  entities: string[];
  sourceMemoryIds?: string[];
}

export interface MemoryQuery {
  npcId: string;
  query?: string;
  entityIds?: string[];
  limit?: number;
}
