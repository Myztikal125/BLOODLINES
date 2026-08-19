export type ActivityType = "attack" | "cast" | "check" | "damage" | "heal" | "save" | "summon" | "transform" | "utility";

export interface Consumption {
  resource: string;
  amount: number | string;
  scaling?: number;
}

export interface Targeting {
  range?: number;
  targets?: number;
  area?: { shape: "sphere" | "cone" | "cube" | "line" | "emanation"; size: number };
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  consumption?: Consumption[];
  targeting?: Targeting;
  formula?: string;
  effects?: string[];
  scaling?: { mode: "level" | "class" | "custom"; formula: string };
}

export function canUseActivity(activity: Activity, resources: Record<string, number>): boolean {
  return (activity.consumption ?? []).every(cost => {
    if (typeof cost.amount !== "number") return true;
    return (resources[cost.resource] ?? 0) >= cost.amount;
  });
}
