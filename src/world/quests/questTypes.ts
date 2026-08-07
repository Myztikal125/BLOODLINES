export interface Quest {
  id: string;
  type: string;
  name: string;
  difficulty: string;

  summary: string;

  startingLocation: string;

  npcs: string[];
  factions: string[];
  locations: string[];

  objectives: string[];

  encounters: string[];

  choices: string[];

  outcomes: string[];

  rewards: string[];

  consequences: string[];

  stateChanges: Record<string, unknown>;

  status?: "available" | "active" | "completed" | "failed";
}
