import { AbilityScores, defaultAbilities } from "./stats";

export interface Character {
  name: string;
  level: number;
  experience: number;

  class: {
    id: string;
    name: string;
    abilities: string[];
  };

  hitPoints: number;
  armorClass: number;

  abilities: AbilityScores;
}

export function createBaseCharacter(
  data: Partial<Character>
): Character {
  return {
    name: data.name ?? "Unknown",
    level: data.level ?? 1,
    experience: data.experience ?? 0,

    class: data.class ?? {
      id: "none",
      name: "None",
      abilities: []
    },

    hitPoints: data.hitPoints ?? 10,
    armorClass: data.armorClass ?? 10,

    abilities: data.abilities ?? defaultAbilities
  };
}
