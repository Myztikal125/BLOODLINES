import type { MemoryQuery, NpcMemory } from "./memoryTypes";

export class MemoryStore {
  private readonly memories = new Map<string, NpcMemory>();

  add(memory: NpcMemory): void {
    this.memories.set(memory.id, memory);
  }

  get(id: string): NpcMemory | undefined {
    return this.memories.get(id);
  }

  recall(query: MemoryQuery, now = Date.now()): NpcMemory[] {
    const candidates = [...this.memories.values()].filter(memory => memory.npcId === query.npcId);
    const requestedEntities = new Set(query.entityIds ?? []);
    const terms = (query.query ?? "").toLowerCase().split(/\s+/).filter(Boolean);

    return candidates
      .map(memory => {
        const ageDays = Math.max(0, (now - memory.createdAt) / 86_400_000);
        const recency = 1 / (1 + ageDays);
        const entityMatch = requestedEntities.size
          ? memory.entities.filter(entity => requestedEntities.has(entity)).length / requestedEntities.size
          : 0;
        const lexical = terms.length
          ? terms.filter(term => memory.content.toLowerCase().includes(term)).length / terms.length
          : 0;
        const score = memory.importance * 0.5 + recency * 0.2 + entityMatch * 0.15 + lexical * 0.15;
        return { memory, score };
      })
      .sort((a, b) => b.score - a.score || b.memory.importance - a.memory.importance)
      .slice(0, query.limit ?? 10)
      .map(({ memory }) => {
        memory.accessCount += 1;
        memory.lastAccessedAt = now;
        return memory;
      });
  }
}
