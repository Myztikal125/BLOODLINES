export class Dice {
  static roll(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  static d20(): number {
    return this.roll(20);
  }

  static advantage(): number {
    return Math.max(this.d20(), this.d20());
  }

  static disadvantage(): number {
    return Math.min(this.d20(), this.d20());
  }
}
