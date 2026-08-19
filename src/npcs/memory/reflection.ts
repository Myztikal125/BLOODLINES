export interface Reflection {
  id: string;
  npcId: string;
  sourceMemoryIds: string[];
  insight: string;
  behavioralRule?: string;
  createdAt: number;
}

export interface ReflectionInput {
  npcId: string;
  memoryIds: string[];
  insight: string;
  behavioralRule?: string;
}

export function createReflection(input: ReflectionInput, now = Date.now()): Reflection {
  return {
    id: `reflection:${input.npcId}:${now}`,
    npcId: input.npcId,
    sourceMemoryIds: [...input.memoryIds],
    insight: input.insight,
    behavioralRule: input.behavioralRule,
    createdAt: now,
  };
}
