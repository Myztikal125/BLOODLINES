import { DataLoader } from "../../data/dataLoader";

export class NPCLoader {

  static loadNPCs() {
    return DataLoader.load("data/npcs/npcs.json");
  }

  static getNPC(id: string) {
    const npcs = this.loadNPCs();

    return npcs.find(
      (npc: any) => npc.id === id
    );
  }
}
