export type SpellResolution = "attack" | "save" | "automatic" | "healing" | "utility";
export type SpellSaveAbility = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  resolution: SpellResolution;
  damage?: string;
  healing?: string;
  saveAbility?: SpellSaveAbility;
  /** What happens when a target succeeds on its saving throw. */
  saveSuccess?: "none" | "half";
  description: string;
}
