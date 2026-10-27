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
    const result = this.resolver.attack(this.attacker, this.target);

    if (!result.hit) {
      return `\n⚔️ Attack misses!\n\nAttack Roll: ${result.roll}\nTotal: ${result.total}\nArmor Class: ${this.target.armorClass}\n`;
    }

    if (result.defeated) {
      return `\n⚔️ Attack hits!\n\nDamage: ${result.damage}\n\n${this.target.name}\nhas been defeated!\n`;
    }

    const hp = typeof this.target.currentHitPoints === "number"
      ? this.target.currentHitPoints
      : this.target.hitPoints;
    return `\n⚔️ Attack hits!\n\nAttack Roll: ${result.roll}\nTotal: ${result.total}\nDamage: ${result.damage}\n\n${this.target.name}\nHP: ${hp}\n`;
  }
}
