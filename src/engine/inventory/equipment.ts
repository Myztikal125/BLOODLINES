import { Item } from "./inventory";

export interface Equipment {
  armor?: Item;
  weapon?: Item;
}

export function createEquipment(): Equipment {
  return {};
}

export function equipArmor(
  equipment: Equipment,
  armor: Item
): Equipment {
  return {
    ...equipment,
    armor
  };
}
