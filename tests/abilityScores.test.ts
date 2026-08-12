import { describe, expect, it } from "vitest";
import {
  abilityScoreCost,
  isValidPointBuy,
  pointBuyCost,
  validatePointBuy
} from "../src/engine/character/stats";

describe("Ability score point buy", () => {
  it("uses the standard point-buy costs", () => {
    expect(abilityScoreCost(8)).toBe(0);
    expect(abilityScoreCost(13)).toBe(5);
    expect(abilityScoreCost(16)).toBe(12);
    expect(abilityScoreCost(18)).toBe(17);
  });

  it("accepts a legal 27-point distribution", () => {
    const abilities = {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8
    };

    expect(pointBuyCost(abilities)).toBe(27);
    expect(isValidPointBuy(abilities)).toBe(true);
    expect(() => validatePointBuy(abilities)).not.toThrow();
  });

  it("rejects scores outside the 8-18 bounds", () => {
    const abilities = {
      strength: 19,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8
    };

    expect(isValidPointBuy(abilities)).toBe(false);
    expect(() => validatePointBuy(abilities)).toThrow();
  });

  it("rejects distributions that do not spend exactly 27 points", () => {
    const abilities = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    };

    expect(pointBuyCost(abilities)).toBe(12);
    expect(isValidPointBuy(abilities)).toBe(false);
  });
});
