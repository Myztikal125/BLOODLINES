export type CombinationTag =
  | "fire" | "shadow" | "blood" | "holy" | "storm" | "frost"
  | "wild" | "void" | "spirit" | "iron" | "support" | "shield"
  | "rage" | "heat" | "arcane" | "martial" | "healing" | "control"
  | "mobility" | "summoning" | "melee" | "ranged";

export interface CombinationRequirement {
  classes?: string[];
  bloodlines?: string[];
  tags: CombinationTag[];
  minLevel?: number;
  requires?: string[];
}

export interface CombinationUnlock {
  id: string;
  name: string;
  summary: string;
  requirements: CombinationRequirement;
  unlocks: string[];
}

export interface CombinationState {
  unlocked: string[];
  available: string[];
  locked: string[];
}

export interface AbilityDefinition {
  id: string;
  name: string;
  description: string;
  tags: CombinationTag[];
  unlockLevel?: number;
  requires?: string[];
  effects: string[];
}
