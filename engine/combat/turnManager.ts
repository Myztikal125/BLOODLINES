export interface TurnOrderCombatant {
  initiative: number;
}

export class TurnManager<T extends TurnOrderCombatant = TurnOrderCombatant> {
  private order: T[] = [];
  private current = 0;

  /**
   * Order combatants by their current initiative value, highest first.
   * The input list is copied so starting combat does not reorder caller state.
   * Equal initiative values preserve the order supplied by the caller.
   */
  start(combatants: T[]): void {
    this.order = combatants
      .map((combatant, originalIndex) => ({ combatant, originalIndex }))
      .sort((a, b) =>
        b.combatant.initiative - a.combatant.initiative ||
        a.originalIndex - b.originalIndex
      )
      .map(({ combatant }) => combatant);

    this.current = 0;
  }

  getCurrent(): T | undefined {
    return this.order[this.current];
  }

  nextTurn(): T | undefined {
    if (this.order.length === 0) {
      this.current = 0;
      return undefined;
    }

    this.current = (this.current + 1) % this.order.length;
    return this.getCurrent();
  }

  getOrder(): T[] {
    return [...this.order];
  }
}
