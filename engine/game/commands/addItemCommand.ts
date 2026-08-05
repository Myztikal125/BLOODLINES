import { Command } from "./command";
import { Inventory } from "../../inventory/inventory";

export class AddItemCommand implements Command {

  name = "add-item";

  constructor(
    private inventory: Inventory
  ) {}

  execute(input: string[]): string {

    const itemName =
      input.join(" ");

    if (!itemName) {

      return "Specify an item name.";

    }

    this.inventory.addItem(itemName);


    return `
Added:
${itemName}
`;

  }

}
