import { CharacterBuilder } from "./characterBuilder";

export interface CharacterOptions {

  name: string;
  ancestry: string;
  background: string;
  className: string;
  bloodline: string;

}

export class CharacterCreation {

  static create(
    options: CharacterOptions
  ) {

    return CharacterBuilder.create(
      options.name,
      options.ancestry,
      options.background,
      options.className,
      options.bloodline
    );

  }

}
