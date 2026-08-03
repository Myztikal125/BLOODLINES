import { Spell } from "./spell";
import { Dice } from "../core/dice";

export class SpellCaster {

  private spellSlots: Record<number, number>;

  constructor() {
    this.spellSlots = {
      1: 2,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
  }

  canCast(spell: Spell): boolean {
    if (spell.level === 0) {
      return true;
    }

    return (this.spellSlots[spell.level] ?? 0) > 0;
  }

  cast(spell: Spell): string {

    if (!this.canCast(spell)) {
      return "No spell slot available.";
    }

    if (spell.level > 0) {
      this.spellSlots[spell.level]--;
    }

    return `${spell.name} was cast!`;
  }

  restoreSlots(): void {
    this.spellSlots = {
      1: 2,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
  }
}
