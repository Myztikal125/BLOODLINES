import { Dice } from "../core/dice";

export interface LegacyAttackResult {
  hit: boolean;
  roll: number;
  total: number;
  damage: number;
  defeated: boolean;
}

export class ActionResolver {
  attack(attacker: any, target: any): LegacyAttackResult {
    if (typeof target?.armorClass !== "number") {
      throw new Error("Cannot resolve attack: target Armor Class is missing.");
    }

    const roll = Dice.d20();
    const attackBonus = typeof attacker?.attackBonus === "number" ? attacker.attackBonus : 0;
    const attackModifier = typeof attacker?.attackModifier === "number" ? attacker.attackModifier : 0;
    const total = roll + attackBonus + attackModifier;
    const hit = roll === 20 || total >= target.armorClass;
    const damage = hit ? Dice.roll(8) : 0;
    const hpKey = typeof target.currentHitPoints === "number" ? "currentHitPoints" : "hitPoints";

    if (hit) {
      if (typeof target[hpKey] !== "number") {
        throw new Error("Cannot apply attack damage: target hit points are missing.");
      }
      target[hpKey] = Math.max(0, target[hpKey] - damage);
    }

    const remainingHP = typeof target[hpKey] === "number" ? target[hpKey] : Infinity;
    return { hit, roll, total, damage, defeated: remainingHP <= 0 };
  }
}
