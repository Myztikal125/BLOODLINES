import { Command } from "./command";
import { Dice } from "../../core/dice";
import { EnemyAI } from "../../combat/enemyAI";

export class CombatCommand implements Command {

  name = "attack";

  private enemyAI =
    new EnemyAI();

  constructor(
    private combat: any,
    private state: any
  ) {}

  execute(args?: string[]): string {

    if (!this.combat.isActive()) {

      return "You are not in combat.";

    }

    if (this.state.character.hitPoints <= 0) {

      return "💀 You cannot fight while defeated.";

    }

    const targetName =
      args?.join(" ") ||
      "";

    const enemy =
      this.combat.state.getEnemy(targetName);

    if (!enemy) {

      return `No enemy found: ${targetName}`;

    }

    const attackRoll =
      Dice.d20();

    let result = "";

    if (attackRoll < enemy.armorClass) {

      result += `
⚔️ You attack ${enemy.name}!

Attack Roll: ${attackRoll}
Armor Class: ${enemy.armorClass}

❌ Miss!
`;

    } else {

      const damage =
        Dice.roll(6);

      enemy.currentHitPoints -= damage;

      result += `
⚔️ You attack ${enemy.name}!

Attack Roll: ${attackRoll}
Armor Class: ${enemy.armorClass}

✅ Hit!

Damage: ${damage}

${enemy.name} HP:
${Math.max(0, enemy.currentHitPoints)}/${enemy.hitPoints}
`;

    }

    if (this.state.character.hitPoints <= 0) {

      result += `

💀 ${this.state.character.name} has fallen!`;

      return result;

    }

    const remainingEnemies =
      this.combat.state.enemies.filter(
        (enemy: any) =>
          enemy.currentHitPoints > 0
      );

    if (remainingEnemies.length === 0) {

      this.combat.end();

      result += `

🎉 Victory!

All enemies have been defeated.`;

      return result;

    }

    const enemyTurns: string[] = [];

    for (const enemy of remainingEnemies) {

      if (this.state.character.hitPoints <= 0) {
        break;
      }

      enemyTurns.push(
        this.enemyAI.takeTurn(
          enemy,
          this.state.character
        )
      );

    }

    result += "\n" + enemyTurns.join("\n");

    if (this.state.character.hitPoints <= 0) {

      result += `

💀 ${this.state.character.name} has fallen!`;

    }

    return result;

  }

}
