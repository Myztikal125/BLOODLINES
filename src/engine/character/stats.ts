export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

const ABILITY_NAMES: (keyof AbilityScores)[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
];

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
  16: 12,
  17: 15,
  18: 17
};

export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 18;

export function abilityScoreCost(score: number): number {
  const cost = POINT_BUY_COSTS[score];
  if (cost === undefined) {
    throw new Error(`Ability score must be an integer from ${POINT_BUY_MIN} to ${POINT_BUY_MAX}.`);
  }
  return cost;
}

export function pointBuyCost(abilities: AbilityScores): number {
  return ABILITY_NAMES.reduce((total, ability) => total + abilityScoreCost(abilities[ability]), 0);
}

export function validatePointBuy(abilities: AbilityScores): void {
  for (const ability of ABILITY_NAMES) {
    const score = abilities[ability];
    if (!Number.isInteger(score) || score < POINT_BUY_MIN || score > POINT_BUY_MAX) {
      throw new Error(`Ability score ${ability} must be an integer from ${POINT_BUY_MIN} to ${POINT_BUY_MAX}.`);
    }
  }

  const spent = pointBuyCost(abilities);
  if (spent !== POINT_BUY_BUDGET) {
    throw new Error(`Ability scores must spend exactly ${POINT_BUY_BUDGET} points; received ${spent}.`);
  }
}

export function isValidPointBuy(abilities: AbilityScores): boolean {
  try {
    validatePointBuy(abilities);
    return true;
  } catch {
    return false;
  }
}

export const defaultAbilities: AbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10
};
