import { Command } from "./command";
import { Inventory } from "../../inventory/inventory";

export class RemoveItemCommand implements Command {

  name = "remove-item";

  constructor(
    private inventory: Inventory
  ) {}

  execute(input: string[]): string {

    const itemName =
      input.join(" ");

    if (!itemName) {

      return "Specify an item name.";

    }

    this.inventory.removeItem(itemName);


    return `
Removed:
${itemName}
`;

  }

}
