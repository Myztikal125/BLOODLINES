import { AbilityScores, defaultAbilities } from "./stats";

export interface Character {
  name: string;
  level: number;
  experience: number;

  ancestry?: string;
  background?: string;

  class: {
    id: string;
    name: string;
    abilities: string[];
  };

  hitPoints: number;
  armorClass: number;
  stamina: number;
  proficiencyBonus: number;

  abilities: AbilityScores;
}

export function createBaseCharacter(
  data: Partial<Character>
): Character {
  return {
    name: data.name ?? "Unknown",
    level: data.level ?? 1,
    experience: data.experience ?? 0,

    ancestry: data.ancestry,
    background: data.background,

    class: data.class ?? {
      id: "none",
      name: "None",
      abilities: []
    },

    hitPoints: data.hitPoints ?? 10,
    armorClass: data.armorClass ?? 10,
    stamina: data.stamina ?? 10,
    proficiencyBonus: data.proficiencyBonus ?? 2,

    abilities: data.abilities ?? defaultAbilities
  };
}
