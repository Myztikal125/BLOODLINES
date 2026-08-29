import { AbilityScores, defaultAbilities } from "./stats";

export interface Character {
  name: string;
  level: number;
  experience: number;

  ancestry: string;
  background: string;

  class: {
    id: string;
    name: string;
    abilities: string[];
  };

  hitPoints: number;
  armorClass: number;

  abilities: AbilityScores;

  stamina?: number;
  proficiencyBonus?: number;
}

export function createBaseCharacter(
  data: Partial<Character>
): Character {
  return {
    name: data.name ?? "Unknown",
    level: data.level ?? 1,
    experience: data.experience ?? 0,

    ancestry: data.ancestry ?? "unknown",
    background: data.background ?? "unknown",

    class: data.class ?? {
      id: "none",
      name: "None",
      abilities: []
    },

    hitPoints: data.hitPoints ?? 10,
    armorClass: data.armorClass ?? 10,

    abilities: data.abilities ?? defaultAbilities,

    stamina: data.stamina,
    proficiencyBonus: data.proficiencyBonus
  };
}
