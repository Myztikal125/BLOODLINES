import { afterEach, describe, expect, test, vi } from "vitest";
import { Dice } from "../engine/core/dice";

describe("Bloodlines Dice Engine", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("d20 returns a number between 1 and 20", () => {
    const roll = Dice.d20();

    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(20);
  });

  test("advantage uses the higher of two d20 rolls", () => {
    const d20 = vi.spyOn(Dice, "d20")
      .mockReturnValueOnce(4)
      .mockReturnValueOnce(12);

    expect(Dice.advantage()).toBe(12);
    expect(d20).toHaveBeenCalledTimes(2);
  });

  test("disadvantage uses the lower of two d20 rolls", () => {
    const d20 = vi.spyOn(Dice, "d20")
      .mockReturnValueOnce(17)
      .mockReturnValueOnce(9);

    expect(Dice.disadvantage()).toBe(9);
    expect(d20).toHaveBeenCalledTimes(2);
  });
});
