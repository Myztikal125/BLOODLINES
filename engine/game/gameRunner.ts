import { GameSession } from "./gameSession";
import { CharacterBuilder } from "../characters/characterBuilder";
import { EncounterDirector } from "../ai/encounterDirector";

export class GameRunner {

  private session: GameSession;
  private encounters: EncounterDirector;

  constructor() {
    this.session = new GameSession();
    this.encounters = new EncounterDirector();
  }

  start() {

    const hero =
      CharacterBuilder.create(
        "Aric",
        "elf",
        "scholar",
        "wizard",
        "shadowveil"
      );

    const opening =
      this.session.start(hero);

    console.log(opening);

    return hero;
  }

  createEncounter() {

    return this.encounters.createEncounter({
      location: "Ashenvale",
      partyLevel: 1,
      partySize: 1,
      danger: "dangerous"
    });

  }

}
