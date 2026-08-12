import { createCharacter } from "../engine/characterFactory";
import { NPC } from "../npcs/npcService";

export interface CompanionDefinition {
  id: string;
  name: string;
  role: string;

  identity: {
    ancestry: string;
    class: string;
    background: string;
  };

  focus: {
    combat: string;
    utility: string;
  };

  personality: {
    traits: string[];
    values: string[];
  };

  story: {
    hook: string;
  };

  recruitment: {
    requirements: string[];
  };

  character: {
    level: number;
    bloodlineIds: string[];
    abilities: ReturnType<typeof createCharacter>["abilities"];
    hitPoints: number;
    armorClass: number;
    stamina: number;
    proficiencyBonus: number;
  };
}

export type CompanionRecruitmentState =
  | "unrecruited"
  | "recruited";

export interface Companion {
  definition: CompanionDefinition;
  character: ReturnType<typeof createCharacter>;
  npc: NPC;
  recruitmentState: CompanionRecruitmentState;
}
