export type ActionType =
  | "attack"
  | "spell"
  | "move"
  | "dash"
  | "defend"
  | "item";

export interface CombatAction {
  type: ActionType;
  name: string;
  description: string;
}

export const Actions: Record<ActionType, CombatAction> = {
  attack: {
    type: "attack",
    name: "Attack",
    description: "Make a weapon or unarmed attack."
  },

  spell: {
    type: "spell",
    name: "Cast Spell",
    description: "Cast a magical ability."
  },

  move: {
    type: "move",
    name: "Move",
    description: "Move across the battlefield."
  },

  dash: {
    type: "dash",
    name: "Dash",
    description: "Gain extra movement."
  },

  defend: {
    type: "defend",
    name: "Defend",
    description: "Focus on protection."
  },

  item: {
    type: "item",
    name: "Use Item",
    description: "Use an item from inventory."
  }
};
