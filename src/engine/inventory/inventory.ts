export interface Item {
  id: string;
  name: string;
  type: string;
}

export interface Inventory {
  items: Item[];
}

export function createInventory(): Inventory {
  return {
    items: []
  };
}

export function addItem(
  inventory: Inventory,
  item: Item
): Inventory {
  return {
    ...inventory,
    items: [
      ...inventory.items,
      item
    ]
  };
}
