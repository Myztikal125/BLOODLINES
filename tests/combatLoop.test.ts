import { describe, expect, test } from "vitest";
import { ActionResolver } from "../engine/combat/actionResolver";

describe("Bloodlines Combat", () => {

  test("attack deals damage", () => {

    const resolver =
      new ActionResolver();

    const target = {
      hitPoints: 10
    };

    const result =
      resolver.attack(
        {},
        target
      );

    expect(result.damage)
      .toBeGreaterThan(0);

  });

});
