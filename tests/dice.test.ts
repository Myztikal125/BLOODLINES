import { describe, expect, test } from "vitest";
import { Dice } from "../engine/core/dice";

describe("Bloodlines Dice Engine", () => {

  test("d20 returns a number between 1 and 20", () => {

    const roll = Dice.d20();

    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(20);

  });

});
