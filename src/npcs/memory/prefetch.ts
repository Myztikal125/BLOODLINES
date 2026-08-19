import type { NpcMemory } from "./memoryTypes";
import { MemoryStore } from "./memoryStore";

export interface PrefetchContext {
  identity: string;
  memories: NpcMemory[];
  recentEvents: string[];
  estimatedTokens: number;
}

export class MemoryPrefetcher {
  constructor(private readonly store: MemoryStore) {}

  buildContext(
    npcId: string,
    identity: string,
    query: string,
    recentEvents: string[] = [],
    tokenBudget = 1800,
  ): PrefetchContext {
    const memories = this.store.recall({ npcId, query, limit: 50 });
    const selected: NpcMemory[] = [];
    let tokens = estimateTokens(identity);

    for (const memory of memories) {
      const cost = estimateTokens(memory.content);
      if (tokens + cost > tokenBudget) break;
      selected.push(memory);
      tokens += cost;
    }

    return {
      identity,
      memories: selected,
      recentEvents: recentEvents.slice(-8),
      estimatedTokens: tokens,
    };
  }
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
