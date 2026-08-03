import { DataLoader } from "../data/dataLoader";

export class WorldLoader {

  static loadWorld() {
    return DataLoader.load("data/world/world.json");
  }

  static getLocation(id: string) {
    const world = this.loadWorld();

    return world.locations.find(
      (location: any) => location.id === id
    );
  }
}
