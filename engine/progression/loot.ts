import { DataLoader } from "../data/dataLoader";

export class LootGenerator {

  static generate() {

    const items =
      DataLoader.load(
        "data/items/items.json"
      );

    const roll =
      Math.floor(
        Math.random() * items.length
      );

    return items[roll];

  }

}
