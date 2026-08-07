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

    const classes = DataLoader.loadClasses();
    const classData = classes.find((c: any) => c.id === className) ?? {};

    const startingHP = classData?.startingHP ?? 8;
    const primaryAbility = classData?.primaryAbility ?? "strength";

    const abilities = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    };

    if (primaryAbility && primaryAbility in abilities) {
      (abilities as any)[primaryAbility] = 16;
    }

    const character = new Character({
      name,
      level: 1,
      experience: 0,
      ancestry,
      background,
      className,
      class: classData,
      bloodline,
      ruleset: "bloodlines",
      hitPoints: startingHP,
      armorClass: 10,
      abilities
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
