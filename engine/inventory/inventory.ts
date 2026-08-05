import { Item } from "./item";

export class Inventory {

  items: Item[] = [];


  addItem(
    name: string,
    quantity: number = 1
  ) {

    const existing =
      this.items.find(
        item => item.name === name
      );


    if (existing) {

      existing.quantity += quantity;

    } else {

      this.items.push({
        name,
        quantity
      });

    }

  }


  removeItem(
    name: string
  ) {

    this.items =
      this.items.filter(
        item => item.name !== name
      );

  }


  list(): string {

    if (this.items.length === 0) {

      return "Inventory is empty.";

    }


    return this.items
      .map(
        item =>
          `${item.name} x${item.quantity}`
      )
      .join("\n");

  }

}
