import { afterEach, describe, expect, test, vi } from "vitest";
import { Dice } from "../engine/core/dice";
import { SpellExecutor } from "../engine/spells/spellExecutor";
import { CastCommand } from "../engine/game/commands/castCommand";

describe("SpellExecutor", () => {
  const caster = () => ({
    name: "Mage",
    data: {
      name: "Mage",
      level: 1,
      class: { primaryAbility: "intelligence" },
      abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 16, wisdom: 10, charisma: 10 }
    }
  });
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
    vi.spyOn(Dice, "d20").mockReturnValue(20);
    vi.spyOn(Dice, "roll").mockReturnValue(10);
    const target = { name: "Target", currentHitPoints: 4, armorClass: 10 };

    const result = new SpellExecutor().cast("firebolt", caster(), target);

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

  test.each(["mage_armor", "shield", "detect_magic"])(
    "does not report unimplemented spell %s as successful or consume a slot",
    spellId => {
      const executor = new SpellExecutor();
      const result = executor.cast(spellId, { name: "Mage" }, { name: "Mage", hitPoints: 10 });

      expect(result.success).toBe(false);
      expect(result.message).toContain("not implemented");
      expect(result.message).toContain("no spell slot was spent");

      // The executor still has both configured level-1 slots because the
      // unsupported cast must not consume one.
      vi.spyOn(Dice, "roll").mockReturnValue(1);
      expect(executor.cast("magic_missile", caster(), { hitPoints: 20 }).success).toBe(true);
      expect(executor.cast("magic_missile", caster(), { hitPoints: 20 }).success).toBe(true);
    }
  );

  test("cast command resolves a requested target through its target provider", () => {
    vi.spyOn(Dice, "d20").mockReturnValue(20);
    vi.spyOn(Dice, "roll").mockReturnValue(1);
    const target = { name: "Target", hitPoints: 5, armorClass: 10 };
    const command = new CastCommand(
      caster(),
      targetName => targetName?.toLowerCase() === "target" ? target : undefined
    );

    expect(command.execute(["firebolt", "Target"])).toContain("damage");
    expect(target.hitPoints).toBe(4);
  });

  test("uses the existing two first-level spell slots and rejects a third cast", () => {
    vi.spyOn(Dice, "roll").mockReturnValue(1);
    const executor = new SpellExecutor();
    const target = { hitPoints: 100 };

    expect(executor.cast("magic_missile", caster(), target).success).toBe(true);
    expect(executor.cast("magic_missile", caster(), target).success).toBe(true);
    const third = executor.cast("magic_missile", caster(), target);

    expect(third.success).toBe(false);
    expect(third.message).toContain("No spell slot");
    expect(target.hitPoints).toBe(88);
  });

  test("does not spend a spell slot when target validation fails", () => {
    vi.spyOn(Dice, "roll").mockReturnValue(1);
    const executor = new SpellExecutor();

    expect(executor.cast("magic_missile", caster(), {}).success).toBe(false);
    expect(executor.cast("magic_missile", caster(), { hitPoints: 20 }).success).toBe(true);
  });


  test("spell attacks use the d20, ability modifier, proficiency, and target AC", () => {
    vi.spyOn(Dice, "d20").mockReturnValue(10);
    vi.spyOn(Dice, "roll").mockReturnValue(3);
    const target = { hitPoints: 20, armorClass: 15 };
    const result = new SpellExecutor().cast("firebolt", caster(), target);
    expect(result.success).toBe(true);
    expect(result.roll).toBe(10);
    expect(result.attackBonus).toBe(5);
    expect(result.total).toBe(15);
    expect(result.damage).toBe(3);
    expect(target.hitPoints).toBe(17);
  });

  test("a missed spell attack consumes a valid spell slot", () => {
    vi.spyOn(Dice, "d20").mockReturnValue(1);
    const executor = new SpellExecutor();
    const target = { hitPoints: 20, armorClass: 10 };
    const miss = executor.cast("guiding_bolt", caster(), target);
    expect(miss.success).toBe(false);
    expect(miss.hit).toBe(false);
    expect(target.hitPoints).toBe(20);
    expect(executor.cast("magic_missile", caster(), { hitPoints: 20 }).success).toBe(true);
    expect(executor.cast("magic_missile", caster(), { hitPoints: 20 }).success).toBe(false);
  });

  test("saving throws use spell save DC and the spell's success effect", () => {
    vi.spyOn(Dice, "d20").mockReturnValue(10);
    vi.spyOn(Dice, "roll").mockReturnValue(6);
    const target = { hitPoints: 20, savingThrows: { dexterity: 2 } };
    const result = new SpellExecutor().cast("burning_hands", caster(), target);
    expect(result.success).toBe(true);
    expect(result.saveDC).toBe(13);
    expect(result.saveSucceeded).toBe(false);
    expect(result.damage).toBe(18);
    expect(target.hitPoints).toBe(2);
  });

  test("rejects saving-throw spells when target save modifiers are missing without spending a slot", () => {
    const executor = new SpellExecutor();
    const target = { hitPoints: 20 };
    expect(executor.cast("burning_hands", caster(), target).success).toBe(false);
    expect(executor.cast("magic_missile", caster(), { hitPoints: 20 }).success).toBe(true);
    expect(executor.cast("magic_missile", caster(), { hitPoints: 20 }).success).toBe(true);
  });

  test("returns a safe failure for unknown spells and targets without HP", () => {
    const executor = new SpellExecutor();

    expect(executor.cast("not_a_spell", { name: "Mage" }, { hitPoints: 10 }).success).toBe(false);
    expect(executor.cast("firebolt", caster(), {}).success).toBe(false);
  });
});
