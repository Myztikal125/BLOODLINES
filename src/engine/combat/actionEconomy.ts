import { ActionSlot } from "./combatAction";

export interface ActionCost {
  staminaCost?: number;
}

export class StaminaResource {
  constructor(public value: number) {}

  canSpend(amount: number): boolean {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Stamina amount must be a non-negative finite number.");
    }
    return this.value >= amount;
  }

  spend(amount: number): void {
    if (!this.canSpend(amount)) {
      throw new Error("Insufficient stamina.");
    }
    this.value -= amount;
  }
}

export class ActionEconomyState {
  private usedAction = false;
  private bonusActionGranted = false;
  private usedBonusAction = false;
  private reactionAuthorized = false;
  private usedReaction = false;

  canUse(slot: ActionSlot): boolean {
    switch (slot) {
      case ActionSlot.Action:
        return !this.usedAction;
      case ActionSlot.BonusAction:
        return this.bonusActionGranted && !this.usedBonusAction;
      case ActionSlot.Reaction:
        return this.reactionAuthorized && !this.usedReaction;
    }
  }

  consume(slot: ActionSlot): void {
    if (!this.canUse(slot)) {
      throw new Error(`Action slot is unavailable: ${slot}`);
    }

    switch (slot) {
      case ActionSlot.Action:
        this.usedAction = true;
        break;
      case ActionSlot.BonusAction:
        this.usedBonusAction = true;
        break;
      case ActionSlot.Reaction:
        this.usedReaction = true;
        break;
    }
  }

  grantBonusAction(): void {
    this.bonusActionGranted = true;
  }

  authorizeReaction(): void {
    this.reactionAuthorized = true;
  }

  startTurn(): void {
    this.usedAction = false;
    this.usedBonusAction = false;
    this.usedReaction = false;
    this.bonusActionGranted = false;
    this.reactionAuthorized = false;
  }
}
