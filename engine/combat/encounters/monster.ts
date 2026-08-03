export interface Monster {
  id: string;
  name: string;
  type: string;
  challenge: number;

  hitPoints: number;
  armorClass: number;

  attack: string;
  damage: string;
}
