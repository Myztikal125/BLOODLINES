import { NPCMemoryService } from "./npcMemory";

export interface NPC {
  id: string;
  name: string;
  role?: string;
  location?: string;
  description?: string;
  faction?: string;
  trust?: number;
  quests?: string[];
}

export class NPCService {

  private npcs: NPC[] = [];
  private memoryService = new NPCMemoryService();

  load(npcs: NPC[]) {
    this.npcs = npcs.map(npc => ({
      ...npc,
      trust: npc.trust ?? 0,
      quests: npc.quests ?? []
    }));
  }

  getAll() {
    return this.npcs;
  }

  getById(id: string) {
    return this.npcs.find(
      npc => npc.id === id
    );
  }

  getByLocation(location: string) {
    return this.npcs.filter(
      npc => npc.location === location
    );
  }

  changeTrust(id: string, amount: number) {
    const npc = this.getById(id);

    if (!npc) return;

    npc.trust = (npc.trust ?? 0) + amount;
  }

  addQuest(id: string, questId: string) {
    const npc = this.getById(id);

    if (!npc) return;

    npc.quests?.push(questId);
  }

  rememberEvent(
    npcId: string,
    playerId: string,
    event: string,
    impact: number
  ) {
    return this.memoryService.addMemory(
      npcId,
      playerId,
      event,
      impact
    );
  }

  getMemory(
    npcId: string,
    playerId: string
  ) {
    return this.memoryService.getMemory(
      npcId,
      playerId
    );
  }

  addKnownFact(
    npcId: string,
    playerId: string,
    fact: string
  ) {
    return this.memoryService.addFact(
      npcId,
      playerId,
      fact
    );
  }
}
