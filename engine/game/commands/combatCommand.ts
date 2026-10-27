import { Command } from "./command";
import { ActionResolver } from "../../combat/actionResolver";
import { EnemyAI } from "../../combat/enemyAI";

export class CombatCommand implements Command {
  name = "attack";
  private enemyAI = new EnemyAI();
  private resolver = new ActionResolver();

  constructor(private combat: any, private state: any) {}

  execute(args?: string[]): string {
    if (!this.combat.isActive()) return "You are not in combat.";
    if (this.state.character.hitPoints <= 0) return "💀 You cannot fight while defeated.";

    const targetName = args?.join(" ") || "";
    const enemy = this.combat.state.getEnemy(targetName);
    if (!enemy) return `No enemy found: ${targetName}`;

    const attack = this.resolver.attack(this.state.character, enemy);
    let result = `\n⚔️ You attack ${enemy.name}!\n\nAttack Roll: ${attack.roll}\nTotal: ${attack.total}\nArmor Class: ${enemy.armorClass}\n`;

    if (!attack.hit) {
      result += "\n❌ Miss!\n";
    } else {
      result += `\n✅ Hit!\n\nDamage: ${attack.damage}\n\n${enemy.name} HP:\n${enemy.currentHitPoints}/${enemy.hitPoints}\n`;
    }

    if (this.state.character.hitPoints <= 0) {
      return result + `\n💀 ${this.state.character.name} has fallen!`;
    }

    const remainingEnemies = this.combat.state.enemies.filter(
      (candidate: any) => candidate.currentHitPoints > 0
    );
    if (remainingEnemies.length === 0) {
      this.combat.end();
      return result + "\n\n🎉 Victory!\n\nAll enemies have been defeated.";
    }

    const enemyTurns: string[] = [];
    for (const remainingEnemy of remainingEnemies) {
      if (this.state.character.hitPoints <= 0) break;
      enemyTurns.push(this.enemyAI.takeTurn(remainingEnemy, this.state.character));
    }

    result += "\n" + enemyTurns.join("\n");
    if (this.state.character.hitPoints <= 0) {
      result += `\n\n💀 ${this.state.character.name} has fallen!`;
    }
    return result;
  }
}
