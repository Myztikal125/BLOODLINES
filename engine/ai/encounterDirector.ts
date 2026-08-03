import { EncounterGenerator, Difficulty } from "../combat/encounters/encounterGenerator";

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
}
