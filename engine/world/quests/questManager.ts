import { Quest } from "./quest";

export class QuestManager {

  private activeQuests: Quest[] = [];

  private completedQuests: Quest[] = [];


  addQuest(quest: Quest) {

    this.activeQuests.push(quest);

  }


  getActiveQuests() {

    return this.activeQuests;

  }


  completeObjective(
    questId: string,
    objectiveId: string
  ) {

    const quest =
      this.activeQuests.find(
        q => q.id === questId
      );

    if (!quest) return null;


    const objective =
      quest.objectives.find(
        o => o.id === objectiveId
      );

    if (!objective) return null;


    objective.completed = true;


    if (
      quest.objectives.every(
        o => o.completed
      )
    ) {

      return this.completeQuest(
        questId
      );

    }


    return null;

  }


  completeQuest(id: string) {

    const index =
      this.activeQuests.findIndex(
        q => q.id === id
      );


    if (index === -1) return null;


    const quest =
      this.activeQuests.splice(
        index,
        1
      )[0];


    quest.completed = true;


    this.completedQuests.push(
      quest
    );


    return quest;

  }


  getCompletedQuests() {

    return this.completedQuests;

  }

}
