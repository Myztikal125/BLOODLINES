import { ActionSlot } from "./combatAction";

/**
 * Per-combatant Action Economy state.
 *
 * This class contains only rules explicitly approved by the Rules Bible:
 * one baseline Action per turn, one Bonus Action when granted, and an
 * explicitly authorized Reaction. Numeric stamina costs and regeneration
 * are intentionally not defined here.
 */
export class ActionEconomyState {
  private actionAvailable = true;
  private bonusActionAvailable = false;
  private reactionAvailable = false;

  canUse(slot: ActionSlot): boolean {
    switch (slot) {
      case ActionSlot.Action:
        return this.actionAvailable;
      case ActionSlot.BonusAction:
        return this.bonusActionAvailable;
      case ActionSlot.Reaction:
        return this.reactionAvailable;
    }
  }

  grantBonusAction(): void {
    this.bonusActionAvailable = true;
  }

  authorizeReaction(): void {
    this.reactionAvailable = true;
  }

  consume(slot: ActionSlot): void {
    if (!this.canUse(slot)) {
      throw new Error(`Unavailable ${slot} slot.`);
    }

    switch (slot) {
      case ActionSlot.Action:
        this.actionAvailable = false;
        break;
      case ActionSlot.BonusAction:
        this.bonusActionAvailable = false;
        break;
      case ActionSlot.Reaction:
        this.reactionAvailable = false;
        break;
    }
  }

  /** Reset the per-turn Action/Bonus Action state and the authorized Reaction. */
  startTurn(): void {
    this.actionAvailable = true;
    this.bonusActionAvailable = false;
    this.reactionAvailable = false;
  }

  /** Reset only the per-turn slots while preserving an explicitly authorized Reaction. */
  startTurnWithReactionAuthorization(): void {
    this.actionAvailable = true;
    this.bonusActionAvailable = false;
    this.reactionAvailable = true;
  }
}

/**
 * Neutral stamina/energy storage. The Rules Bible does not define a maximum,
 * regeneration rate, or action-specific costs, so this class stores only the
 * current resource and spends only an explicitly supplied amount.
 */
export class StaminaResource {
  constructor(private current: number) {}

  get value(): number {
    return this.current;
  }

  canSpend(amount: number): boolean {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Stamina amount must be a non-negative finite number.");
    }
    return this.current >= amount;
  }

  spend(amount: number): void {
    if (!this.canSpend(amount)) {
      throw new Error("Insufficient stamina.");
    }
    this.current -= amount;
  }
}
