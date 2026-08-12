import { CombatRound, CombatRoundLifecycle } from "./combatRound";
import { RestLifecycle, RestType } from "./rest";

export class CombatController {
  private readonly rounds = new CombatRoundLifecycle();
  private readonly rest = new RestLifecycle();

  startCombat(): CombatRound {
    return this.rounds.start();
  }

  nextRound(): CombatRound {
    return this.rounds.advance();
  }

  getCurrentRound(): CombatRound | undefined {
    return this.rounds.getCurrent();
  }

  beginRest(type: RestType): RestType {
    return this.rest.begin(type);
  }

  getCurrentRest(): RestType | undefined {
    return this.rest.getCurrent();
  }

  endRest(): void {
    this.rest.clear();
  }

  attack() {
    return "Combat system ready.";
  }
}
