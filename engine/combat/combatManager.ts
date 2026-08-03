import { Combatant } from "./combatant";

export class CombatManager {
  private combatants: Combatant[] = [];
  private turnIndex: number = 0;
  private round: number = 1;

  addCombatant(combatant: Combatant): void {
    this.combatants.push(combatant);
  }

  startCombat(): void {
    this.combatants.sort(
      (a, b) => b.initiative - a.initiative
    );

    this.turnIndex = 0;
    this.round = 1;
  }

  getCurrentTurn(): Combatant {
    return this.combatants[this.turnIndex];
  }

  nextTurn(): void {
    this.turnIndex++;

    if (this.turnIndex >= this.combatants.length) {
      this.turnIndex = 0;
      this.round++;
    }
  }

  getRound(): number {
    return this.round;
  }

  getCombatants(): Combatant[] {
    return this.combatants;
  }
}
