import { ActionEconomyState } from "./actionEconomy";
import { ActionResolver } from "./actionResolver";
import { ActionSlot, CombatAction } from "./combatAction";

export class AttackAction implements CombatAction {
  readonly type = "attack" as const;
  readonly slot = ActionSlot.Action;

  constructor(
    private resolver: ActionResolver,
    private attacker: any,
    private target: any,
    private economy: ActionEconomyState
  ) {}

  execute(): string {
    if (!this.economy.canUse(this.slot)) {
      throw new Error("Action slot already consumed for this turn.");
    }

    // No stamina cost is assigned: the Rules Bible does not authorize one.
    this.economy.consume(this.slot);

    const result = this.resolver.attack(
      this.attacker,
      this.target
    );

    if (result.defeated) {
      return `
⚔️ Attack hits!

${this.target.name}
has been defeated!
`;
    }

    return `
⚔️ Attack hits!

Damage:
${result.damage}

${this.target.name}
HP:
${this.target.hitPoints}
`;
  }
}
