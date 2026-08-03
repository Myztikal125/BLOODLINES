import { RewardSystem } from "./rewards";
import { LootGenerator } from "./loot";

export class RewardManager {

  completeEncounter(
    difficulty: string
  ) {

    const reward =
      RewardSystem.encounterReward(
        difficulty
      );

    const loot =
      LootGenerator.generate();

    return {

      experience:
        reward.experience,

      gold:
        reward.gold,

      loot

    };

  }

}
