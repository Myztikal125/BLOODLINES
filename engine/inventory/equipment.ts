import { Item } from "./item";

export type EquipmentSlot =
  | "mainHand"
  | "offHand"
  | "armor"
  | "accessory";

export class Equipment {

  private slots: Record<EquipmentSlot, Item | null> = {
    mainHand: null,
    offHand: null,
    armor: null,
    accessory: null
  };

  equip(
    slot: EquipmentSlot,
    item: Item
  ): void {

    this.slots[slot] = item;

  }

  unequip(
    slot: EquipmentSlot
  ): Item | null {

    const item = this.slots[slot];

    this.slots[slot] = null;

    return item;
  }

  getEquipment() {
    return this.slots;
  }

}
