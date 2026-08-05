import { PlayerProgress } from "./playerProgress";

export class RewardHandler {

  constructor(
    private progress: PlayerProgress
  ) {}


  grant(
    reward: {
      experience: number;
      gold: number;
    }
  ) {

    const leveled =
      this.progress.addExperience(
        reward.experience
      );


    this.progress.addGold(
      reward.gold
    );


    return {

      experience:
        reward.experience,

      gold:
        reward.gold,

      leveled

    };

  }

}
