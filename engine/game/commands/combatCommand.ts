import { Command } from "./command";

export class CombatCommand implements Command {

  name = "attack";

  constructor(
    private combat: any
  ) {}

  execute(args?: string[]): string {

    if (!this.combat.active) {

      return "You are not in combat.";

    }

    const target =
      args?.join(" ") ||
      "enemy";

    return `
⚔️ You attack ${target}!
`;

  }

}
