import { afterEach, describe, expect, test, vi } from "vitest";
import { Dice } from "../engine/core/dice";
import { ActionResolver } from "../engine/combat/actionResolver";

describe("Legacy ActionResolver combat path", () => {
  afterEach(() => vi.restoreAllMocks());

  test("misses when d20 plus modifiers is below AC and deals no damage", () => {
    vi.spyOn(Dice, "d20").mockReturnValue(4);
    const damage = vi.spyOn(Dice, "roll").mockReturnValue(6);
    const target = { name: "Guard", armorClass: 15, hitPoints: 12 };

    const result = new ActionResolver().attack({ attackBonus: 1 }, target);

    expect(result).toMatchObject({ hit: false, roll: 4, total: 5, damage: 0, defeated: false });
    expect(target.hitPoints).toBe(12);
    expect(damage).not.toHaveBeenCalled();
  });

  test("hits at AC and applies dice damage only on a hit", () => {
    vi.spyOn(Dice, "d20").mockReturnValue(12);
    vi.spyOn(Dice, "roll").mockReturnValue(5);
    const target = { name: "Guard", armorClass: 12, hitPoints: 12 };

    const result = new ActionResolver().attack({ attackBonus: 0 }, target);

    expect(result).toMatchObject({ hit: true, roll: 12, total: 12, damage: 5, defeated: false });
    expect(target.hitPoints).toBe(7);
  });

  test("supports enemy records that store currentHitPoints", () => {
    vi.spyOn(Dice, "d20").mockReturnValue(20);
    vi.spyOn(Dice, "roll").mockReturnValue(8);
    const target = { name: "Goblin", armorClass: 13, hitPoints: 8, currentHitPoints: 8 };

    const result = new ActionResolver().attack({}, target);

    expect(result).toMatchObject({ hit: true, damage: 8, defeated: true });
    expect(target.currentHitPoints).toBe(0);
    expect(target.hitPoints).toBe(8);
  });

  test("fails closed when target AC is missing", () => {
    expect(() => new ActionResolver().attack({}, { hitPoints: 10 }))
      .toThrow("target Armor Class is missing");
  });
});
