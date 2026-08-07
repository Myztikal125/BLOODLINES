export interface Weapon {
  id: string;
  name: string;
  damage: string;
  finesse?: boolean;
}

export interface AttackResult {
  weapon: string;
  damageDice: string;
  attackBonus: number;
}

export function createAttack(
  weapon: Weapon,
  abilityModifier: number,
  proficiencyBonus = 2
): AttackResult {
  return {
    weapon: weapon.name,
    damageDice: weapon.damage,
    attackBonus:
      abilityModifier + proficiencyBonus
  };
}
