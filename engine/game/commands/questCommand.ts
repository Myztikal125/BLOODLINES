import { Command } from "./command";
import { QuestManager } from "../../world/quests/questManager";

export class QuestCommand implements Command {

  name = "quests";

  constructor(
    private quests: QuestManager
  ) {}

  execute(): string {

    const active =
      this.quests.getActiveQuests();


    if (active.length === 0) {

      return "No active quests.";

    }


    return `

Active Quests:

${active.map(
  quest => `

${quest.title}

${quest.description}

Objectives:

${quest.objectives.map(
  obj =>
    `[${obj.completed ? "X" : " "}] ${obj.description}`
).join("\n")}

Rewards:
${quest.rewards.experience} XP
${quest.rewards.gold} Gold

`
).join("\n")}

`;

  }

}
