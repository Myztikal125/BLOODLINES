export class CombatState {

  active = false;

  enemies: any[] = [];

  start(enemies: any[]) {

    this.active = true;
    this.enemies = enemies;

  }

  end() {

    this.active = false;
    this.enemies = [];

  }

}
