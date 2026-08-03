import { describe, expect, test } from "vitest";
import { FeatureManager } from "../engine/characters/featureManager";

describe("Bloodlines Features", () => {

  test("unlocks a feature", () => {

    const manager =
      new FeatureManager();

    manager.addFeature(
      "shadow_step"
    );

    expect(
      manager.hasFeature("shadow_step")
    ).toBe(true);

  });

});
