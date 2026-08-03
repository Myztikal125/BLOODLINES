import { ActionResolver } from "./actionResolver";

export class AttackAction {

  constructor(
    private resolver: ActionResolver,
    private attacker: any,
    private target: any
  ) {}

  execute(): string {

    const result =
      this.resolver.attack(
        this.attacker,
        this.target
      );

    if (result.defeated) {

      return `
⚔️ Attack hits!

${this.target.name}
has been defeated!
`;

    }

    return `
⚔️ Attack hits!

Damage:
${result.damage}

${this.target.name}
HP:
${this.target.hitPoints}
`;

  }

}
