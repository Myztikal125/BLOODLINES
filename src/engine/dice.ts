export interface RandomSource {
  next(): number;
}

export class SeededRandom implements RandomSource {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    // Mulberry32: deterministic and sufficient for game simulation/evaluation.
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export function rollDie(sides: number, rng: RandomSource = new SeededRandom(Date.now())): number {
  if (!Number.isInteger(sides) || sides < 1) throw new Error("Die sides must be a positive integer");
  return Math.floor(rng.next() * sides) + 1;
}

export function rollDice(count: number, sides: number, rng: RandomSource): number[] {
  if (!Number.isInteger(count) || count < 0) throw new Error("Dice count must be a non-negative integer");
  return Array.from({ length: count }, () => rollDie(sides, rng));
}
