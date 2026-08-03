import { Dice } from "../core/dice";
import { modifier } from "../core/attributes";
import { Combatant } from "./combatant";

export interface AttackResult {
  hit: boolean;
  roll: number;
  total: number;
  damage: number;
}

export class AttackResolver {

  static makeAttack(
    attacker: Combatant,
    target: Combatant,
    attackBonus: number,
    damageDie: number,
    abilityScore: number
  ): AttackResult {

    const roll = Dice.d20();

    const total =
      roll +
      modifier(abilityScore) +
      attackBonus;

    const hit = roll === 20 || total >= target.armorClass;

    const damage = hit
      ? Dice.roll(damageDie) + modifier(abilityScore)
      : 0;

    if (hit) {
      target.hitPoints -= damage;

      if (target.hitPoints <= 0) {
        target.hitPoints = 0;
        target.alive = false;
      }
    }

    return {
      hit,
      roll,
      total,
      damage
    };
  }
}
