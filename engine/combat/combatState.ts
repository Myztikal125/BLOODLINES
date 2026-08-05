export class CombatState {

  active = false;

  enemies: any[] = [];

  start(enemies: any[]) {

    this.active = true;

    this.enemies = enemies.map(
      (enemy, index) => ({
        ...enemy,
        name:
          enemies.length > 1
            ? `${enemy.name} #${index + 1}`
            : enemy.name,
        currentHitPoints: enemy.hitPoints
      })
    );

  }

  getEnemy(name: string) {

    return this.enemies.find(
      enemy =>
        enemy.name.toLowerCase() ===
        name.toLowerCase()
    );

  }

  end() {

    this.active = false;

    this.enemies = [];

  }

}
