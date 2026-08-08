import { Dice } from "../core/dice";
import { modifier } from "../core/attributes";
import { Combatant } from "./combatant";

export type RollState = "NORMAL" | "ADVANTAGE" | "DISADVANTAGE";

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
    abilityScore: number,
    rollState: RollState = "NORMAL"
  ): AttackResult {

    // The caller is responsible for determining the roll state from
    // authorized rules, abilities, conditions, or DM decisions.
    let roll: number;

    switch (rollState) {
      case "ADVANTAGE":
        roll = Dice.advantage();
        break;
      case "DISADVANTAGE":
        roll = Dice.disadvantage();
        break;
      case "NORMAL":
      default:
        roll = Dice.d20();
        break;
    }

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
