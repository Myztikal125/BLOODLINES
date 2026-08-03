import { describe, expect, test } from "vitest";
import { EncounterDirector } from "../engine/ai/encounterDirector";

describe("Bloodlines AI Encounter Director", () => {

  test("creates danger-based encounters", () => {

    const director = new EncounterDirector();

    const encounter =
      director.createEncounter({
        location: "Blackspire Keep",
        partyLevel: 1,
        partySize: 4,
        danger: "dangerous"
      });

    expect(encounter.monsters.length)
      .toBeGreaterThan(0);

  });

});
