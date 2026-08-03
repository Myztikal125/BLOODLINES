import { describe, expect, test } from "vitest";
import { ExperienceSystem } from "../engine/progression/experience";

describe("Bloodlines Progression", () => {

  test("calculates level from experience", () => {

    const level =
      ExperienceSystem.calculateLevel(900);

    expect(level).toBe(3);

  });

});
