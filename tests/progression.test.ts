import { describe, expect, test } from "vitest";
import { ExperienceSystem } from "../engine/progression/experience";
import { PlayerProgress } from "../engine/progression/playerProgress";

describe("Bloodlines Progression", () => {
  test("calculates level from experience", () => {
    expect(ExperienceSystem.calculateLevel(900)).toBe(3);
  });

  test("does not level up before the next XP threshold", () => {
    const progress = new PlayerProgress();

    expect(progress.addExperience(299)).toBe(false);
    expect(progress.level).toBe(1);
    expect(progress.experience).toBe(299);
  });

  test("levels up when the first threshold is reached", () => {
    const progress = new PlayerProgress();

    expect(progress.addExperience(300)).toBe(true);
    expect(progress.level).toBe(2);
  });

  test("catches up across multiple levels when a large reward is granted", () => {
    const progress = new PlayerProgress();

    expect(progress.addExperience(900)).toBe(true);
    expect(progress.level).toBe(3);
  });

  test("does not report another level-up when XP stays within the same level", () => {
    const progress = new PlayerProgress();
    progress.addExperience(300);

    expect(progress.addExperience(100)).toBe(false);
    expect(progress.level).toBe(2);
    expect(progress.experience).toBe(400);
  });
});
