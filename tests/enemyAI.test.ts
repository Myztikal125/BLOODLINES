import { describe, expect, test } from "vitest";
import { EnemyAI } from "../engine/combat/enemyAI";

describe("Bloodlines Enemy AI", () => {

  test("enemy can attack", () => {

    const ai =
      new EnemyAI();

    const player = {
      name: "Hero",
      hitPoints: 20
    };

    const result =
      ai.takeTurn(
        {
          name: "Goblin",
          hitPoints: 7
        },
        player
      );

    expect(result)
      .toContain("Goblin");

  });

});
