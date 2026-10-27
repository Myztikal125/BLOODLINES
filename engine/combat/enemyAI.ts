import { ActionResolver } from "./actionResolver";

export class EnemyAI {
  private resolver = new ActionResolver();

  takeTurn(enemy: any, target: any): string {
    const result = this.resolver.attack(enemy, target);
    const hp = typeof target.currentHitPoints === "number"
      ? target.currentHitPoints
      : target.hitPoints;

    if (!result.hit) {
      return `\n${enemy.name} attacks!\n\nAttack Roll: ${result.roll}\nTotal: ${result.total}\nArmor Class: ${target.armorClass}\n❌ Miss!\n\n${target.name} HP:\n${hp}\n`;
    }

    return `\n${enemy.name} attacks!\n\nAttack Roll: ${result.roll}\nTotal: ${result.total}\n✅ Hit!\nDamage: ${result.damage}\n\n${target.name} HP:\n${hp}\n`;
  }
}
