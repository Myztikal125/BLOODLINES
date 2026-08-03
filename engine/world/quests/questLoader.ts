import { DataLoader } from "../../data/dataLoader";

export class QuestLoader {

  static loadQuests() {
    return DataLoader.load("data/quests/quests.json");
  }

  static getQuest(id: string) {
    const quests = this.loadQuests();

    return quests.find(
      (quest: any) => quest.id === id
    );
  }
}
