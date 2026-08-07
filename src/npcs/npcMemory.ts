import { NPCMemory, MemoryEntry } from "./types";

export class NPCMemoryService {
  private memories: Map<string, NPCMemory> = new Map();

  private getKey(npcId: string, playerId: string): string {
    return `${npcId}:${playerId}`;
  }

  getMemory(npcId: string, playerId: string): NPCMemory {
    const key = this.getKey(npcId, playerId);

    if (!this.memories.has(key)) {
      this.memories.set(key, {
        npcId,
        playerId,
        trust: 0,
        respect: 0,
        fear: 0,
        memories: [],
        knownFacts: [],
        completedQuests: [],
        relationshipStage: "stranger"
      });
    }

    return this.memories.get(key)!;
  }

  addMemory(
    npcId: string,
    playerId: string,
    event: string,
    impact: number
  ): NPCMemory {

    const memory = this.getMemory(npcId, playerId);

    const entry: MemoryEntry = {
      event,
      impact,
      timestamp: Date.now()
    };

    memory.memories.push(entry);

    if (impact > 0) {
      memory.trust += impact;
      memory.respect += Math.floor(impact / 2);
    } else {
      memory.fear += Math.abs(impact);
    }

    this.updateRelationship(memory);

    return memory;
  }

  addFact(
    npcId: string,
    playerId: string,
    fact: string
  ): NPCMemory {

    const memory = this.getMemory(npcId, playerId);

    if (!memory.knownFacts.includes(fact)) {
      memory.knownFacts.push(fact);
    }

    return memory;
  }


  completeQuest(
    npcId: string,
    playerId: string,
    questId: string
  ): NPCMemory {

    const memory = this.getMemory(
      npcId,
      playerId
    );

    if (!memory.completedQuests.includes(questId)) {
      memory.completedQuests.push(questId);
    }

    return memory;
  }

  private updateRelationship(memory: NPCMemory) {

    if (memory.trust >= 50) {
      memory.relationshipStage = "ally";
    } else if (memory.trust >= 20) {
      memory.relationshipStage = "friend";
    } else if (memory.trust < 0) {
      memory.relationshipStage = "enemy";
    } else {
      memory.relationshipStage = "stranger";
    }
  }
}
