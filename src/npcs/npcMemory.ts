import { NPCMemory, MemoryEntry } from "./types";

export class NPCMemoryService {
  private memories: Map<string, NPCMemory> = new Map();

  private getKey(npcId: string, subjectId: string): string {
    return `${npcId}:${subjectId}`;
  }

  getMemory(npcId: string, subjectId: string): NPCMemory {
    const key = this.getKey(npcId, subjectId);

    if (!this.memories.has(key)) {
      this.memories.set(key, {
        npcId,
        subjectId,
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
    subjectId: string,
    event: string,
    impact: number
  ): NPCMemory {

    const memory = this.getMemory(npcId, subjectId);

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

  adjustRelationship(
    npcId: string,
    subjectId: string,
    trust: number,
    respect: number,
    fear: number,
    event?: string
  ): NPCMemory {

    const memory = this.getMemory(
      npcId,
      subjectId
    );

    memory.trust += trust;
    memory.respect += respect;
    memory.fear += fear;

    if (event) {
      memory.memories.push({
        event,
        impact: trust,
        timestamp: Date.now()
      });
    }

    this.updateRelationship(memory);

    return memory;
  }

  addFact(
    npcId: string,
    subjectId: string,
    fact: string
  ): NPCMemory {

    const memory = this.getMemory(
      npcId,
      subjectId
    );

    if (!memory.knownFacts.includes(fact)) {
      memory.knownFacts.push(fact);
    }

    return memory;
  }

  completeQuest(
    npcId: string,
    subjectId: string,
    questId: string
  ): NPCMemory {

    const memory = this.getMemory(
      npcId,
      subjectId
    );

    if (!memory.completedQuests.includes(questId)) {
      memory.completedQuests.push(questId);
    }

    return memory;
  }

  private updateRelationship(memory: NPCMemory) {

    if (memory.trust < 0 && memory.fear < 10) {
      memory.relationshipStage = "enemy";
      return;
    }

    if (memory.fear >= 10 && memory.trust < 20) {
      memory.relationshipStage = "afraid";
      return;
    }

    if (memory.trust >= 50) {
      memory.relationshipStage = "ally";
      return;
    }

    if (memory.trust >= 20) {
      memory.relationshipStage = "friend";
      return;
    }

    memory.relationshipStage = "stranger";
  }
}
