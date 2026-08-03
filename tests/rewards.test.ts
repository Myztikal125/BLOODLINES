import { describe, expect, test } from "vitest";
import { RewardManager } from "../engine/progression/rewardManager";

describe("Bloodlines Rewards", () => {

  test("generates encounter rewards", () => {

    const manager =
      new RewardManager();

    const reward =
      manager.completeEncounter(
        "medium"
      );

    expect(
      reward.experience
    ).toBeGreaterThan(0);

  });

});
