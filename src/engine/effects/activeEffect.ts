export type EffectMode = "add" | "multiply" | "override" | "remove";

export interface ActiveEffect {
  id: string;
  sourceId: string;
  targetPath: string;
  mode: EffectMode;
  value: number | string | boolean;
  priority?: number;
  condition?: string;
  duration?: { type: "rounds" | "minutes" | "hours" | "until_rest" | "permanent"; value?: number };
}

export function sortEffects(effects: ActiveEffect[]): ActiveEffect[] {
  return [...effects].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0) || a.id.localeCompare(b.id));
}
