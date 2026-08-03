import { AbilityScores, modifier } from "../../core/attributes";

export interface DerivedStats {
  proficiencyBonus: number;
  initiative: number;
  passivePerception: number;
  hitPoints: number;
}

export class DerivedStatsCalculator {

  static proficiencyBonus(level: number): number {
    return Math.ceil(level / 4) + 1;
  }

  static calculate(
    level: number,
    abilities: AbilityScores,
    hitDie: number = 8
  ): DerivedStats {

    return {
      proficiencyBonus: this.proficiencyBonus(level),

      initiative: modifier(abilities.dexterity),

      passivePerception:
        10 + modifier(abilities.wisdom),

      hitPoints:
        hitDie + modifier(abilities.constitution)
    };
  }
}
