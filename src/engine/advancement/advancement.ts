export type AdvancementType = "abilityScore" | "chooseItems" | "grantItems" | "hitPoints" | "scaleValue" | "size" | "subclass" | "trait";

export interface Advancement {
  id: string;
  level: number;
  type: AdvancementType;
  optional?: boolean;
  config: Record<string, unknown>;
}

export interface AdvancementChoice {
  advancementId: string;
  values: string[];
}

export class AdvancementEngine {
  available(advancements: Advancement[], level: number): Advancement[] {
    return advancements.filter(advancement => advancement.level <= level);
  }

  apply(advancement: Advancement, choice?: AdvancementChoice): Record<string, unknown> {
    if (advancement.optional && !choice) return { id: advancement.id, skipped: true };
    return {
      id: advancement.id,
      type: advancement.type,
      level: advancement.level,
      choice: choice?.values ?? [],
      config: structuredClone(advancement.config),
    };
  }
}
