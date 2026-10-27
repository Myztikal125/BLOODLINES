import { Command } from "./command";
import { Inventory } from "../../inventory/inventory";

export class RemoveItemCommand implements Command {
  name = "remove-item";

  constructor(private inventory: Inventory) {}

  execute(input: string[]): string {
    let quantity: number | undefined;
    let itemName = input.join(" ").trim();

    if (input.length > 1 && /^\d+$/.test(input[0])) {
      quantity = Number(input[0]);
      itemName = input.slice(1).join(" ").trim();
    }

    if (!itemName) return "Specify an item name.";
    if (quantity !== undefined && (!Number.isSafeInteger(quantity) || quantity <= 0)) {
      return "Quantity must be a positive whole number.";
    }

    const removed = this.inventory.removeItem(itemName, quantity);
    if (removed === 0) return `No matching item found: ${itemName}.`;
    return quantity === undefined
      ? `Removed ${itemName} (×${removed}).`
      : `Removed ${removed} × ${itemName}.`;
  }
}