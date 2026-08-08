import { CombatState } from "./combatState";
import { RulesRuntime } from "../rules/rulesRuntime";

export class CombatController {

  state = new CombatState();

  constructor(private readonly rules?: RulesRuntime) {}

  start(enemies: any[]) {

    if (this.rules && !this.rules.isApproved("Combat Rounds")) {
      throw new Error(
        "Combat is unavailable because the Combat Rounds system is not approved in the Rules Bible."
      );
    }

    this.state.start(enemies);

    return "Combat has started.";

  }

  isActive() {

    return this.state.active;

  }

}
