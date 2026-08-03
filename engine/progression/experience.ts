export class ExperienceSystem {

  static xpForLevel(level: number): number {

    const table: Record<number, number> = {
      1: 0,
      2: 300,
      3: 900,
      4: 2700,
      5: 6500,
      6: 14000,
      7: 23000,
      8: 34000,
      9: 48000,
      10: 64000
    };

    return table[level] ?? level * 10000;
  }

  static calculateLevel(xp: number): number {

    let level = 1;

    while (
      this.xpForLevel(level + 1) <= xp
    ) {
      level++;
    }

    return level;
  }

}
