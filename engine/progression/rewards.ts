export interface Reward {
  experience: number;
  gold: number;
}

export class RewardSystem {

  static encounterReward(
    difficulty: string
  ): Reward {

    const rewards: Record<string, Reward> = {

      easy: {
        experience: 50,
        gold: 10
      },

      medium: {
        experience: 100,
        gold: 25
      },

      hard: {
        experience: 250,
        gold: 50
      },

      deadly: {
        experience: 500,
        gold: 100
      }

    };

    return rewards[difficulty] ?? rewards.medium;
  }

}
