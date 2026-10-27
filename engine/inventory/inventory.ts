import { Item } from "./item";

export class Inventory {
  items: Item[] = [];

  addItem(item: string | Item, quantity = 1): void {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new RangeError("Item quantity must be a positive whole number.");
    }

    const incoming: Item = typeof item === "string"
      ? { name: item, quantity }
      : { ...item, quantity };

    if (!incoming.name.trim()) {
      throw new Error("Item name cannot be empty.");
    }

    const key = incoming.id
      ? `id:${incoming.id.toLowerCase()}`
      : `name:${incoming.name.trim().toLowerCase()}`;
    const existing = this.items.find(current => {
      const currentKey = current.id
        ? `id:${current.id.toLowerCase()}`
        : `name:${current.name.trim().toLowerCase()}`;
      return currentKey === key;
    });

    if (existing) {
      existing.quantity = (existing.quantity ?? 1) + quantity;
      // Preserve known item metadata if the new stack was added by name only.
      for (const [field, value] of Object.entries(incoming)) {
        if (field !== "quantity" && value !== undefined) {
          (existing as any)[field] = value;
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