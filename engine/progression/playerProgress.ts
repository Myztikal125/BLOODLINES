import { ExperienceSystem } from "./experience";

export class PlayerProgress {
  experience: number = 0;
  gold: number = 0;
  level: number = 1;

  addExperience(amount: number) {
    const previousLevel = this.level;
    this.experience += amount;
    this.level = ExperienceSystem.calculateLevel(this.experience);
    return this.level > previousLevel;
  }

  addGold(amount: number) {
    this.gold += amount;
  }
}
