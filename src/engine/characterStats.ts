import { calculateHitPoints } from "./rules/hitPoints";
import { getEquipmentArmorClass } from "./inventory/equipmentStats";
import { createInventory } from "./inventory/inventory";
import { createEquipment } from "./inventory/equipment";

export function buildCharacterStats(
  classData: any,
  level: number,
  abilities: Record<string, number>
) {
  const constitution = abilities.constitution ?? 10;
  const dexterity = abilities.dexterity ?? 10;

  const inventory = createInventory();
  const equipment = createEquipment();

  return {
    hitPoints: calculateHitPoints(
      "dnd2014",
      classData.hitDie,
      level,
      constitution
    ),
    armorClass: getEquipmentArmorClass(
      dexterity,
      equipment
    ),
    inventory,
    equipment
  };
}
