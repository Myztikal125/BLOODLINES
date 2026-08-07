import { describe, it, expect } from "vitest";
import { loadData } from "../src/engine/dataLoader";

describe("Armor Data", () => {
  it("loads leather armor", () => {
    const armor = loadData("items/armor", "leather");

    expect(armor.id).toBe("leather");
    expect(armor.baseAC).toBe(11);
  });

  it("loads chain mail", () => {
    const armor = loadData("items/armor", "chain_mail");

    expect(armor.id).toBe("chain_mail");
    expect(armor.baseAC).toBe(16);
  });
});
