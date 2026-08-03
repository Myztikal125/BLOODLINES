import { Item } from "./item";

export class Inventory {

  private items: Item[] = [];

  add(item: Item): void {
    this.items.push(item);
  }

  remove(id: string): void {
    this.items =
      this.items.filter(
        item => item.id !== id
      );
  }

  getItems(): Item[] {
    return this.items;
  }

}
