export interface NPCInteractionResult {
  response: string;

  memoryEvent: {
    event: string;
    impact: number;
  };

  relationshipChange: {
    trust: number;
    respect: number;
    fear: number;
  };
}
