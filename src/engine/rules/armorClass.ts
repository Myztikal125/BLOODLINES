export interface ArmorData {
  baseAC: number;
  dexterityBonus: boolean;
}

export function calculateArmorClass(
  dexterity: number,
  armor?: ArmorData
): number {
  const dexModifier = Math.floor((dexterity - 10) / 2);

  if (!armor) {
    return 10 + dexModifier;
  }

  return (
    armor.baseAC +
    (armor.dexterityBonus ? dexModifier : 0)
  );
}
