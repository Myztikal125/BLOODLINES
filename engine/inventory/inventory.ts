import { Item } from "./item";

export class Inventory {
  items: Item[] = [];

  addItem(item: string | Item, quantity?: number): void {
    const incomingQuantity = quantity ?? (typeof item === "string" ? 1 : item.quantity ?? 1);
    if (!Number.isSafeInteger(incomingQuantity) || incomingQuantity <= 0) {
      throw new RangeError("Item quantity must be a positive whole number.");
    }

    const incoming: Item = typeof item === "string"
      ? { name: item, quantity: incomingQuantity }
      : { ...item, quantity: incomingQuantity };

    if (!incoming.name.trim()) {
      throw new Error("Item name cannot be empty.");
    }

    const existing = this.items.find(current =>
      current.name.trim().toLowerCase() === incoming.name.trim().toLowerCase() ||
      (!!incoming.id && current.id?.toLowerCase() === incoming.id.toLowerCase())
    );

    if (existing) {
      existing.quantity = (existing.quantity ?? 1) + incomingQuantity;
      // A name-only add must not erase canonical names or item metadata.
      if (typeof item !== "string") {
        for (const [field, value] of Object.entries(incoming)) {
          if (field !== "quantity" && value !== undefined) {
            (existing as any)[field] = value;
          }
        }
      }
      return;
    }

    this.items.push(incoming);
  }

  /**
   * Removes a quantity from a stack. Omitting quantity preserves the legacy
   * behavior of removing the entire matching stack.
   * Returns the number of items removed.
   */
  removeItem(nameOrId: string, quantity?: number): number {
    if (quantity !== undefined && (!Number.isSafeInteger(quantity) || quantity <= 0)) {
      throw new RangeError("Removal quantity must be a positive whole number.");
    }

    const query = nameOrId.trim().toLowerCase();
    const index = this.items.findIndex(item =>
      item.name.trim().toLowerCase() === query ||
      item.id?.trim().toLowerCase() === query
    );

    if (index < 0) return 0;

    const item = this.items[index];
    const currentQuantity = item.quantity ?? 1;

    if (quantity === undefined || quantity >= currentQuantity) {
      this.items.splice(index, 1);
      return currentQuantity;
    }

    item.quantity = currentQuantity - quantity;
    return quantity;
  }

  list(): string {
    if (this.items.length === 0) return "Inventory is empty.";

    return this.items
      .map(item => {
        const quantity = item.quantity ?? 1;
        const details = [
          item.type,
          item.rarity,
          item.damage ? `Damage ${item.damage}` : undefined,
          item.armorClass !== undefined ? `AC ${item.armorClass}` : undefined,
          item.value !== undefined ? `Value ${item.value}` : undefined
        ].filter(Boolean).join(" · ");
        return `${item.name} x${quantity}${details ? ` — ${details}` : ""}`;
      })
      .join("\n");
  }
}