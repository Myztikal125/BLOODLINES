import { Quest } from "./quest";

export class QuestManager {

  private activeQuests: Quest[] = [];

  private completedQuests: Quest[] = [];

  addQuest(quest: Quest) {

    this.activeQuests.push(
      quest
    );

  }

  getActiveQuests() {

    return this.activeQuests;

  }

  completeQuest(id: string) {

    const index =
      this.activeQuests.findIndex(
        quest => quest.id === id
      );

    if (index === -1) {
      return false;
    }

    const quest =
      this.activeQuests.splice(
        index,
        1
      )[0];

    this.completedQuests.push(
      quest
    );

    return true;

  }

  getCompletedQuests() {

    return this.completedQuests;

  }

}
