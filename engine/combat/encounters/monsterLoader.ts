import { DataLoader } from "../../data/dataLoader";

export class MonsterLoader {

  static loadMonsters() {
    return DataLoader.load("data/monsters/monsters.json");
  }

  static getMonster(id: string) {
    const monsters = this.loadMonsters();

    return monsters.find(
      (monster: any) => monster.id === id
    );
  }
}
