const hitDice: Record<string, number> = {
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12
};

function averageHitDie(die: number): number {
  return Math.floor(die / 2) + 1;
}

export function calculateHitPoints(
  ruleset: string,
  hitDie: string,
  level: number,
  constitution: number
): number {
  const die = hitDice[hitDie] ?? 6;
  const conModifier = Math.floor((constitution - 10) / 2);

  const firstLevel = die + conModifier;

  if (level <= 1) {
    return firstLevel;
  }

  switch (ruleset) {
    case "dnd2014":
    case "dnd2024":
      return (
        firstLevel +
        ((level - 1) *
          (averageHitDie(die) + conModifier))
      );

    case "bloodlines":
    default:
      return (
        firstLevel +
        ((level - 1) *
          (averageHitDie(die) + conModifier))
      );
  }
}
