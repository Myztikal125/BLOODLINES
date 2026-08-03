import { DataLoader } from "../data/dataLoader";

export class SpellLoader {

  static getSpells() {
    return DataLoader.load("data/spells/spells.json");
  }

  static getSpell(id: string) {
    const spells = this.getSpells();

    return spells.find(
      (spell: any) => spell.id === id
    );
  }
}
