import { Command } from "./command";
import { QuestManager } from "../../world/quests/questManager";
import { RewardHandler } from "../../progression/rewardHandler";

export class ObjectiveCommand implements Command {

  name = "objective";

  constructor(
    private quests: QuestManager,
    private rewards: RewardHandler
  ) {}

  execute(args?: string[]): string {

    const questId =
      args?.[0] || "lost-scholar";

    const objectiveId =
      args?.[1] || "find-scholar";


    const quest =
      this.quests.completeObjective(
        questId,
        objectiveId
      );


    if (!quest) {

      return `
Objective not found.
`;

    }


    if (quest.completed) {

      const reward =
        this.rewards.grant(
          quest.rewards
        );

      return `
Objective Completed:

${objectiveId}


Quest Completed:
${quest.title}


Rewards:

+${reward.experience} XP
+${reward.gold} Gold
`;

    }


    return `
Objective Completed:

${objectiveId}
`;

  }

}
