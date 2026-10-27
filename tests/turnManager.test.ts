import { describe, expect, it } from "vitest";
import { TurnManager } from "../engine/combat/turnManager";

describe("TurnManager", () => {
  it("orders combatants by current initiative, highest first", () => {
    const turns = new TurnManager();
    turns.start([
      { name: "slow", initiative: 2 },
      { name: "fast", initiative: 9 },
      { name: "middle", initiative: 5 }
    ]);

    expect(turns.getOrder().map(combatant => combatant.initiative))
      .toEqual([9, 5, 2]);
  });

  it("preserves input order for ties without mutating the caller's list", () => {
    const turns = new TurnManager();
    const combatants = [
      { name: "first", initiative: 4 },
      { name: "second", initiative: 4 },
      { name: "third", initiative: 8 }
    ];

    turns.start(combatants);

    expect(turns.getOrder().map(combatant => combatant.name))
      .toEqual(["third", "first", "second"]);
    expect(combatants.map(combatant => combatant.name))
      .toEqual(["first", "second", "third"]);
  });

  it("advances through turns and wraps to the first combatant", () => {
    const turns = new TurnManager();
    turns.start([
      { name: "first", initiative: 8 },
      { name: "second", initiative: 3 }
    ]);

    expect(turns.getCurrent()?.initiative).toBe(8);
    expect(turns.nextTurn()?.initiative).toBe(3);
    expect(turns.nextTurn()?.initiative).toBe(8);
  });

  it("handles an empty combat without returning a fake combatant", () => {
    const turns = new TurnManager();
    turns.start([]);

    expect(turns.getCurrent()).toBeUndefined();
    expect(turns.nextTurn()).toBeUndefined();
    expect(turns.getOrder()).toEqual([]);
  });
});
