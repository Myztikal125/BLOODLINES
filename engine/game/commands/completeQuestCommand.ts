import { Command } from "./command";
import { QuestManager } from "../../world/quests/questManager";
import { RewardHandler } from "../../progression/rewardHandler";

export class CompleteQuestCommand implements Command {

  name = "complete";

  constructor(
    private quests: QuestManager,
    private rewards: RewardHandler
  ) {}

  execute(input?: string): string {

    const questId =
      input || "lost-scholar";

    const quest =
      this.quests.completeQuest(
        questId
      );

    if (!quest) {

      return `
Quest not found or not complete.
`;

    }

    const reward =
      this.rewards.grant(
        quest.rewards
      );

    return `
Quest Completed:
${quest.title}

Rewards Received:

+${reward.experience} XP
+${reward.gold} Gold
`;

  }

}
