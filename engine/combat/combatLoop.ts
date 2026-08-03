import { EnemyAI } from "./enemyAI";

export class CombatLoop {

  private enemyAI =
    new EnemyAI();

  enemyTurn(
    enemies: any[],
    player: any
  ) {

    return enemies.map(
      enemy =>
        this.enemyAI.takeTurn(
          enemy,
          player
        )
    );

  }

}
