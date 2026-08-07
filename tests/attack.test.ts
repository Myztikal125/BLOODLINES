import { describe, it, expect } from "vitest";
import { createAttack } from "../src/engine/combat/attack";

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
