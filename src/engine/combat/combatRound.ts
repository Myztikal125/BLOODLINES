export const COMBAT_ROUND_DURATION_SECONDS = 6;

export class CombatRound {
  readonly durationSeconds = COMBAT_ROUND_DURATION_SECONDS;
  readonly number: number;

  constructor(number: number) {
    if (!Number.isInteger(number) || number < 1) {
      throw new Error("Combat round number must be a positive integer.");
    }
    this.number = number;
  }
}

export class CombatRoundLifecycle {
  private current: CombatRound | undefined;

  start(): CombatRound {
    this.current = new CombatRound(1);
    return this.current;
  }

  advance(): CombatRound {
    const nextNumber = (this.current?.number ?? 0) + 1;
    this.current = new CombatRound(nextNumber);
    return this.current;
  }

  getCurrent(): CombatRound | undefined {
    return this.current;
  }
}
