import { Command } from "./command";
import { Inventory } from "../../inventory/inventory";
import { ItemLoader } from "../../inventory/itemLoader";

export class AddItemCommand implements Command {
  name = "add-item";

  constructor(private inventory: Inventory) {}

  execute(input: string[]): string {
    let quantity = 1;
    let itemName = input.join(" ").trim();

    if (input.length > 1 && /^\d+$/.test(input[0])) {
      quantity = Number(input[0]);
      itemName = input.slice(1).join(" ").trim();
    }

    if (!itemName) return "Specify an item name.";
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      return "Quantity must be a positive whole number.";
    }

    const catalogItem = ItemLoader.getItem(itemName);
    if (catalogItem) {
      this.inventory.addItem(catalogItem, quantity);
      return `Added ${quantity} × ${catalogItem.name}.`;
    }

    // Keep support for custom/narrative items that are not in the catalogue.
    this.inventory.addItem(itemName, quantity);
    return `Added ${quantity} × ${itemName} (custom item).`;
  }
}