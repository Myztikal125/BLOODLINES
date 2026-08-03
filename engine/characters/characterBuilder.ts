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

    const character = new Character({
      name,
      level: 1,
      experience: 0,

      ancestry,
      background,
      className,
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
