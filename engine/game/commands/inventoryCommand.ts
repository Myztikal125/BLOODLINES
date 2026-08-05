import { Command } from "./command";
import { Inventory } from "../../inventory/inventory";

export class InventoryCommand implements Command {

  name = "inventory";

  constructor(
    private inventory: Inventory
  ) {}

  execute(): string {

    return `
=== INVENTORY ===

${this.inventory.list()}
`;

  }

}
