export interface NPCMemory {
  npcId: string;
  subjectId: string;

  trust: number;
  respect: number;
  fear: number;

  memories: MemoryEntry[];
  knownFacts: string[];

  completedQuests: string[];

  relationshipStage: string;
}

export interface MemoryEntry {
  event: string;
  impact: number;
  timestamp: number;
}
