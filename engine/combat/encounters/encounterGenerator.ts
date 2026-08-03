import { MonsterLoader } from "./monsterLoader";

export type Difficulty =
  | "easy"
  | "medium"
  | "hard"
  | "deadly";

export interface Encounter {
  difficulty: Difficulty;
  monsters: any[];
}

export class EncounterGenerator {

  static generate(
    partyLevel: number,
    partySize: number,
    difficulty: Difficulty
  ): Encounter {

    const monsters = MonsterLoader.loadMonsters();

    let count = 1;

    if (partySize >= 4) {
      count = 2;
    }

    if (difficulty === "hard") {
      count += 1;
    }

    if (difficulty === "deadly") {
      count += 2;
    }

    const selected = [];

    for (let i = 0; i < count; i++) {
      selected.push(
        monsters[
          Math.floor(Math.random() * monsters.length)
        ]
      );
    }

    return {
      difficulty,
      monsters: selected
    };
  }
}
