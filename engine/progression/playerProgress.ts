export class PlayerProgress {

  experience: number = 0;

  gold: number = 0;

  level: number = 1;


  addExperience(amount: number) {

    this.experience += amount;

    return this.checkLevelUp();

  }


  addGold(amount: number) {

    this.gold += amount;

  }


  private checkLevelUp() {

    const needed =
      this.level * 300;


    if (this.experience >= needed) {

      this.level++;

      return true;

    }

    return false;

  }

}
