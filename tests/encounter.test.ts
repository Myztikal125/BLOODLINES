import { describe, expect, test } from "vitest";
import { EncounterGenerator } from "../engine/combat/encounters/encounterGenerator";

describe("Bloodlines Encounter Generator", () => {

  test("creates an encounter", () => {

    const encounter =
      EncounterGenerator.generate(
        1,
        4,
        "medium"
      );

    expect(encounter.monsters.length)
      .toBeGreaterThan(0);

  });

});
