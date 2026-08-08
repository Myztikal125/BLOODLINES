import { afterEach, describe, expect, it, test, vi } from "vitest";
import { createAttack } from "../src/engine/combat/attack";
import { AttackResolver, RollState } from "../engine/combat/attack";
import { Combatant } from "../engine/combat/combatant";

describe("Attack System", () => {
  it("creates a dagger attack", () => {
    const attack = createAttack(
      {
        id: "dagger",
        name: "Dagger",
        damage: "1d4",
        finesse: true
      },
      3
    );

    expect(attack.weapon).toBe("Dagger");
    expect(attack.damageDice).toBe("1d4");
    expect(attack.attackBonus).toBe(5);
  });
});

describe("BLOODLINES Attack Resolver", () => {
  afterEach(() => vi.restoreAllMocks());

  const attacker: Combatant = {
    id: "attacker",
    name: "Attacker",
    hitPoints: 20,
    maxHitPoints: 20,
    armorClass: 10,
    initiative: 0,
    alive: true
  };

  const target = (): Combatant => ({
    id: "target",
    name: "Target",
    hitPoints: 20,
    maxHitPoints: 20,
    armorClass: 15,
    initiative: 0,
    alive: true
  });

  test("NORMAL uses one d20", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    const result = AttackResolver.makeAttack(attacker, target(), 0, 1, 10, "NORMAL");
    expect(result.roll).toBe(15);
  });

  test("ADVANTAGE uses the higher d20 result", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);
    const result = AttackResolver.makeAttack(attacker, target(), 0, 1, 10, "ADVANTAGE");
    expect(result.roll).toBe(19);
    expect(result.hit).toBe(true);
  });

  test("DISADVANTAGE uses the lower d20 result", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);
    const result = AttackResolver.makeAttack(attacker, target(), 0, 1, 10, "DISADVANTAGE");
    expect(result.roll).toBe(3);
    expect(result.hit).toBe(false);
  });

  test("roll state is limited to the approved states", () => {
    const states: RollState[] = ["NORMAL", "ADVANTAGE", "DISADVANTAGE"];
    expect(states).toEqual(["NORMAL", "ADVANTAGE", "DISADVANTAGE"]);
  });
});
