import { CombatState } from "./combatState";

export class CombatController {

  state = new CombatState();

  start(enemies: any[]) {

    this.state.start(enemies);

    return "Combat has started.";

  }

  isActive() {

    return this.state.active;

  }

}
