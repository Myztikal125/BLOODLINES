export type ModifierOperation = "add" | "multiply" | "set";

export interface Modifier {
  id: string;
  source: string;
  target: string;
  operation: ModifierOperation;
  value: number;
  priority?: number;
}

export interface DerivedStatRule {
  stat: string;
  base: string;
  modifiers?: string[];
  clamp?: { min?: number; max?: number };
}

export type StatMap = Record<string, number>;

/**
 * Deterministic rules cruncher for BLOODLINES.
 *
 * The AI/content layer should describe mechanics; this module resolves the
 * numeric result so narration never has to invent a number.
 */
export function applyModifiers(base: StatMap, modifiers: Modifier[]): StatMap {
  const result: StatMap = { ...base };
  const ordered = [...modifiers].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0) || a.id.localeCompare(b.id));

  for (const modifier of ordered) {
    const current = result[modifier.target] ?? 0;
    switch (modifier.operation) {
      case "add":
        result[modifier.target] = current + modifier.value;
        break;
      case "multiply":
        result[modifier.target] = current * modifier.value;
        break;
      case "set":
        result[modifier.target] = modifier.value;
        break;
    }
  }

  return result;
}

export function deriveStats(base: StatMap, rules: DerivedStatRule[], modifiers: Modifier[] = []): StatMap {
  const result = applyModifiers(base, modifiers);

  for (const rule of rules) {
    let value = result[rule.base] ?? 0;
    const relevant = modifiers
      .filter(modifier => modifier.target === rule.stat && (rule.modifiers?.includes(modifier.id) ?? true))
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0) || a.id.localeCompare(b.id));

    for (const modifier of relevant) {
      if (modifier.operation === "add") value += modifier.value;
      else if (modifier.operation === "multiply") value *= modifier.value;
      else value = modifier.value;
    }

    if (rule.clamp?.min !== undefined) value = Math.max(rule.clamp.min, value);
    if (rule.clamp?.max !== undefined) value = Math.min(rule.clamp.max, value);
    result[rule.stat] = value;
  }

  return result;
}
