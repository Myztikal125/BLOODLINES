export type CombatActionType =
  | "attack"
  | "spell"
  | "item"
  | "defend"
  | "flee";

export enum ActionSlot {
  Action = "action",
  BonusAction = "bonusAction",
  Reaction = "reaction",
}

export interface CombatAction {
  type: CombatActionType;
  slot: ActionSlot;
  /**
   * Optional because the Rules Bible does not define numeric stamina costs.
   * Concrete actions must not invent a cost.
   */
  staminaCost?: number;
  execute(): string;
}
