import { afterEach, describe, expect, test, vi } from "vitest";
import { Dice } from "../engine/core/dice";
import { SpellExecutor } from "../engine/spells/spellExecutor";

describe("SpellExecutor", () => {
  afterEach(() => vi.restoreAllMocks());

  test("rolls the listed spell damage expression instead of a generic d8", () => {
    vi.spyOn(Dice, "roll").mockReturnValue(2);
    const target = { name: "Target", hitPoints: 20, maxHitPoints: 20 };

    const result = new SpellExecutor().cast(
      "magic_missile",
      { name: "Mage" },
      target
    );

    expect(result.success).toBe(true);
    expect(result.damage).toBe(9);
    expect(target.hitPoints).toBe(11);
    expect(Dice.roll).toHaveBeenCalledTimes(3);
    expect(Dice.roll).toHaveBeenCalledWith(4);
  });

  test("supports currentHitPoints and never reduces health below zero", () => {
    vi.spyOn(Dice, "roll").mockReturnValue(10);
    const target = { name: "Target", currentHitPoints: 4 };

    const result = new SpellExecutor().cast("firebolt", { name: "Mage" }, target);

    expect(result.success).toBe(true);
    expect(target.currentHitPoints).toBe(0);
    expect(result.defeated).toBe(true);
  });

  test("heals using the spell's healing expression and respects maximum HP", () => {
    vi.spyOn(Dice, "roll").mockReturnValue(8);
    const target = { name: "Ally", hitPoints: 9, maxHitPoints: 10 };

    const result = new SpellExecutor().cast("cure_wounds", { name: "Mage" }, target);

    expect(result.success).toBe(true);
    expect(result.healing).toBe(1);
    expect(target.hitPoints).toBe(10);
    expect(Dice.roll).toHaveBeenCalledWith(8);
  });

  test("returns a safe failure for unknown spells and targets without HP", () => {
    const executor = new SpellExecutor();

    expect(executor.cast("not_a_spell", { name: "Mage" }, { hitPoints: 10 }).success).toBe(false);
    expect(executor.cast("firebolt", { name: "Mage" }, {}).success).toBe(false);
  });
});
