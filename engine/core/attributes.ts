export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export function modifier(score: number): number {
  return Math.floor((score - 10) / 2);
}
