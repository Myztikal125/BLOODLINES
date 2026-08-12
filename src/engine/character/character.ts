import { ActionEconomyState } from "./combat/actionEconomy";
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
  stamina?: number;
  proficiencyBonus?: number;
  ancestry?: string;
  background?: string;
  bloodlineIds?: string[];
  actionEconomy: ActionEconomyState;

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
    stamina: data.stamina,
    proficiencyBonus: data.proficiencyBonus,
    ancestry: data.ancestry,
    background: data.background,
    bloodlineIds: data.bloodlineIds,
    actionEconomy: data.actionEconomy ?? new ActionEconomyState(),

    abilities: data.abilities ?? defaultAbilities
  };
}
