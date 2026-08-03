export class ActionResolver {

  attack(
    attacker: any,
    target: any
  ) {

    const damage =
      Math.floor(
        Math.random() * 8
      ) + 1;

    target.hitPoints -= damage;

    return {
      damage,
      defeated:
        target.hitPoints <= 0
    };

  }

}
