import { calculateArmorClass } from "../rules/armorClass";
import { Equipment } from "./equipment";

export function getEquipmentArmorClass(
  dexterity: number,
  equipment: Equipment
): number {
  return calculateArmorClass(
    dexterity,
    equipment.armor as any
  );
}
