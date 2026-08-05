import { ActionResolver } from "./actionResolver";

export class EnemyAI {

  private resolver =
    new ActionResolver();

  takeTurn(
    enemy: any,
    target: any
  ): string {

    const result =
      this.resolver.attack(
        enemy,
        target
      );

    target.hitPoints =
      Math.max(0, target.hitPoints);

    return `
${enemy.name} attacks!

Damage:
${result.damage}

${target.name} HP:
${target.hitPoints}
`;

  }

}
