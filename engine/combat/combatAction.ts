export type CombatActionType =
  | "attack"
  | "spell"
  | "item"
  | "defend"
  | "flee";

export interface CombatAction {

  type: CombatActionType;

  execute(): string;

}
