import { describe, it, expect } from "vitest";
import { loadData } from "../src/engine/dataLoader";

describe("Weapon Data", () => {
  it("loads dagger", () => {
    const weapon = loadData("items/weapons", "dagger");

    expect(weapon.id).toBe("dagger");
    expect(weapon.damage).toBe("1d4");
  });

  it("loads quarterstaff", () => {
    const weapon = loadData("items/weapons", "quarterstaff");

    expect(weapon.id).toBe("quarterstaff");
    expect(weapon.damage).toBe("1d6");
  });
});
