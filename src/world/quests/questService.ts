import { Quest } from "./questTypes";

export class QuestService {

  private quests: Map<string, Quest> = new Map();

  load(quests: Quest[]) {
    for (const quest of quests) {
      this.quests.set(quest.id, {
        ...quest,
        status: quest.status ?? "available"
      });
    }
  }

  getAll() {
    return Array.from(this.quests.values());
  }

  getById(id: string) {
    return this.quests.get(id);
  }

  startQuest(id: string) {

    const quest = this.quests.get(id);

    if (!quest) return;

    quest.status = "active";

    return quest;
  }

  completeQuest(id: string) {

    const quest = this.quests.get(id);

    if (!quest) return;

    quest.status = "completed";

    return quest;
  }

  failQuest(id: string) {

    const quest = this.quests.get(id);

    if (!quest) return;

    quest.status = "failed";

    return quest;
  }
}
