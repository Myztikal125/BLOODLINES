import { AbilityScores } from "../core/attributes";

export type Ruleset = "dnd2014" | "dnd2024" | "bloodlines";

export interface CharacterClassData {
  id: string;
  name: string;
  description?: string;
  role?: string;
  hitDie?: string;
  primaryAbility?: string;

  signatureSpellSlots?: number;
  startingSpells?: string[];
  abilities?: string[];
  features?: any[];
  progression?: any[];
  spells?: any;
  bloodlineInteractions?: any[];
}

export interface CharacterData {
  name: string;
  level: number;
  experience: number;

  ancestry: string;
  background: string;
  className: string;
  class: CharacterClassData;
  bloodline: string;

  ruleset: Ruleset;

  hitPoints: number;
  armorClass: number;

  abilities: AbilityScores;
}

export class Character {
  data: CharacterData;

  constructor(data: CharacterData) {
    this.data = data;
  }

  get class(): CharacterClassData {
    return this.data.class;
  }

  getModifier(stat: keyof AbilityScores): number {
    return Math.floor((this.data.abilities[stat] - 10) / 2);
  }

  levelUp(): void {
    this.data.level += 1;
  }

  gainExperience(amount: number): void {
    this.data.experience += amount;
  }
}
