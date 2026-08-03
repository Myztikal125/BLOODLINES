import { GameSession } from "./gameSession";
import { CharacterCreation } from "../characters/characterCreation";
import { EncounterDirector } from "../ai/encounterDirector";
import { CharacterOptions } from "../characters/characterCreation";

export class GameRunner {

  private session: GameSession;
  private encounters: EncounterDirector;

  constructor() {
    this.session = new GameSession();
    this.encounters = new EncounterDirector();
  }

  start(options: CharacterOptions) {

    const hero =
      CharacterCreation.create(options);

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
