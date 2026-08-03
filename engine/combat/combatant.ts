export interface Combatant {
  id: string;
  name: string;

  hitPoints: number;
  maxHitPoints: number;

  armorClass: number;

  initiative: number;

  alive: boolean;
}

export function createCombatant(
  name: string,
  hp: number,
  armorClass: number,
  initiative: number
): Combatant {

  return {
    id: crypto.randomUUID(),

    name,

    hitPoints: hp,
    maxHitPoints: hp,

    armorClass,

    initiative,

    alive: true
  };
}
