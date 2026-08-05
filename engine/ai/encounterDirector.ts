import { EncounterGenerator, Difficulty } from "../combat/encounters/encounterGenerator";
import { narrateEncounter } from "../../src/ai/encounterNarrator";

export interface EncounterRequest {
  location: string;
  partyLevel: number;
  partySize: number;
  danger: "safe" | "dangerous" | "deadly";
}

export class EncounterDirector {

  createEncounter(request: EncounterRequest) {

    let difficulty: Difficulty = "medium";

    if (request.danger === "safe") {
      difficulty = "easy";
    }

    if (request.danger === "dangerous") {
      difficulty = "hard";
    }

    if (request.danger === "deadly") {
      difficulty = "deadly";
    }

    return EncounterGenerator.generate(
      request.partyLevel,
      request.partySize,
      difficulty
    );
  }

  async narrate(
    location: string,
    character: any,
    encounter: any
  ) {
    return await narrateEncounter(
      location,
      character,
      encounter
    );
  }
}
