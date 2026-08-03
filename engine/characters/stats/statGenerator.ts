import { Dice } from "../../core/dice";

export class StatGenerator {

  static rollAbility(): number {
    const rolls = [
      Dice.roll(6),
      Dice.roll(6),
      Dice.roll(6),
      Dice.roll(6)
    ];

    rolls.sort((a, b) => a - b);

    return rolls[1] + rolls[2] + rolls[3];
  }

  static rollSet() {
    return {
      strength: this.rollAbility(),
      dexterity: this.rollAbility(),
      constitution: this.rollAbility(),
      intelligence: this.rollAbility(),
      wisdom: this.rollAbility(),
      charisma: this.rollAbility()
    };
  }
}
