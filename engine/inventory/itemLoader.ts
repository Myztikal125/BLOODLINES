import { DataLoader } from "../data/dataLoader";
import { Item } from "./item";

export class ItemLoader {
  static getItems(): Item[] {
    return DataLoader.load("data/items/items.json") as Item[];
  }

  static getItem(idOrName: string): Item | undefined {
    const query = idOrName.trim().toLowerCase();
    return this.getItems().find(item =>
      item.id?.toLowerCase() === query ||
      item.name.trim().toLowerCase() === query
    );
  }
}