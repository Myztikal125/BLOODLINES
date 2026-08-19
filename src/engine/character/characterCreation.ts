export type CharacterCreationSource = "bloodlines" | "dnd2014" | "dnd2024";

export interface ChoiceOption {
  id: string;
  label: string;
  prerequisites?: string[];
  grants?: string[];
  modifiers?: Array<{ target: string; operation: "add" | "multiply" | "set"; value: number }>;
}

export interface CharacterCreationStep {
  id: string;
  label: string;
  required: boolean;
  options: ChoiceOption[];
  minSelections?: number;
  maxSelections?: number;
}

export interface CharacterBuild {
  source: CharacterCreationSource;
  selections: Record<string, string[]>;
  grants: string[];
}

export class CharacterCreationEngine {
  validate(steps: CharacterCreationStep[], selections: Record<string, string[]>): string[] {
    const errors: string[] = [];

    for (const step of steps) {
      const chosen = selections[step.id] ?? [];
      const min = step.minSelections ?? (step.required ? 1 : 0);
      const max = step.maxSelections ?? 1;
      if (chosen.length < min) errors.push(`${step.id}: requires at least ${min} selection(s)`);
      if (chosen.length > max) errors.push(`${step.id}: allows at most ${max} selection(s)`);

      const validIds = new Set(step.options.map(option => option.id));
      for (const id of chosen) if (!validIds.has(id)) errors.push(`${step.id}: invalid option '${id}'`);
    }

    return errors;
  }

  build(steps: CharacterCreationStep[], selections: Record<string, string[]>, source: CharacterCreationSource): CharacterBuild {
    const errors = this.validate(steps, selections);
    if (errors.length) throw new Error(`Invalid character build:\n${errors.join("\n")}`);

    const grants: string[] = [];
    for (const step of steps) {
      for (const option of step.options) {
        if (!(selections[step.id] ?? []).includes(option.id)) continue;
        grants.push(...(option.grants ?? []));
      }
    }

    return { source, selections: structuredClone(selections), grants: [...new Set(grants)] };
  }
}
