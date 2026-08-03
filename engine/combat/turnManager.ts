export class TurnManager {

  private order: any[] = [];

  private current = 0;

  start(combatants: any[]) {

    this.order =
      combatants.sort(
        () =>
          Math.random() - 0.5
      );

    this.current = 0;

  }

  getCurrent() {

    return this.order[
      this.current
    ];

  }

  nextTurn() {

    this.current++;

    if (
      this.current >= this.order.length
    ) {
      this.current = 0;
    }

    return this.getCurrent();

  }

  getOrder() {

    return this.order;

  }

}
