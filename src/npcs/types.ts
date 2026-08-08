export type RelationshipStage =
  | "stranger"
  | "friend"
  | "ally"
  | "afraid"
  | "enemy";

export interface NPCMemory {
  npcId: string;
  subjectId: string;

  trust: number;
  respect: number;
  fear: number;

  memories: MemoryEntry[];
  knownFacts: string[];

  completedQuests: string[];

  relationshipStage: RelationshipStage;
}

export interface MemoryEntry {
  event: string;
  impact: number;
  timestamp: number;
}
