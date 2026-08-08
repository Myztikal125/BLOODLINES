import { describe, it, expect, vi, afterEach } from "vitest";
import { Dice } from "../engine/core/dice";
import { AttackResolver, RollState } from "../engine/combat/attack";
import { Combatant } from "../engine/combat/combatant";

function combatant(overrides: Partial<Combatant> = {}): Combatant {
  return {
    id: "test",
    name: "Test",
    hitPoints: 20,
    maxHitPoints: 20,
    armorClass: 10,
    initiative: 0,
    alive: true,
    ...overrides
  };
}

describe("AttackResolver roll states", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses a normal d20 roll for NORMAL", () => {
    vi.spyOn(Dice, "d20").mockReturnValue(7);
    const target = combatant({ armorClass: 20 });

    const result = AttackResolver.makeAttack(
      combatant(), target, 0, 1, 10, "NORMAL"
    );

    expect(result.roll).toBe(7);
  });

  it("uses the higher d20 roll for ADVANTAGE", () => {
    vi.spyOn(Dice, "d20").mockReturnValueOnce(7).mockReturnValueOnce(15);
    const target = combatant({ armorClass: 20 });

    const result = AttackResolver.makeAttack(
      combatant(), target, 0, 1, 10, "ADVANTAGE"
    );

    expect(result.roll).toBe(15);
  });

  it("uses the lower d20 roll for DISADVANTAGE", () => {
    vi.spyOn(Dice, "d20").mockReturnValueOnce(15).mockReturnValueOnce(7);
    const target = combatant({ armorClass: 20 });

    const result = AttackResolver.makeAttack(
      combatant(), target, 0, 1, 10, "DISADVANTAGE"
    );

    expect(result.roll).toBe(7);
  });

  it("supports explicit cancellation by resolving with NORMAL", () => {
    vi.spyOn(Dice, "d20").mockReturnValue(11);
    const target = combatant({ armorClass: 20 });

    const state: RollState = "NORMAL";
    const result = AttackResolver.makeAttack(
      combatant(), target, 0, 1, 10, state
    );

    expect(result.roll).toBe(11);
  });
});
