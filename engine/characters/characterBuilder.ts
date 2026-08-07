import { Character } from "./character";
import { DataLoader } from "../data/dataLoader";

export class CharacterBuilder {
  static create(
    name: string,
    ancestry: string,
    background: string,
    className: string,
    bloodline: string
  ): Character {

    const classData = DataLoader.loadClasses()
      .find((c: any) => c.id === className);

    if (!classData) {
      throw new Error(`Class not found: ${className}`);
    }

    const level = 1;

    const characterClass = {
      ...classData,

      signatureSpellSlots:
        className === "wizard"
          ? 1
          : 0,

      startingSpells:
        classData.spells?.spellList ?? [],

      abilities:
        classData.abilities ?? []
    };

    const character = new Character({
      name,
      level,
      experience: 0,

      ancestry,
      background,

      className,
      class: characterClass,

      bloodline,

      ruleset: "bloodlines",

      hitPoints: 10,
      armorClass: 10,

      abilities: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      }
    });

    return character;
  }

  static getOptions() {
    return {
      ancestries: DataLoader.loadAncestries(),
      classes: DataLoader.loadClasses(),
      backgrounds: DataLoader.loadBackgrounds(),
      bloodlines: DataLoader.loadBloodlines()
    };
  }
}
