import { Monster } from "./monster";
import { MonsterLoader } from "./monsterLoader";

export type Difficulty = "easy" | "medium" | "hard" | "deadly";

export interface Encounter {
  difficulty: Difficulty;
  monsters: Monster[];
}

export class EncounterGenerator {
  static generate(
    partyLevel: number,
    partySize: number,
    difficulty: Difficulty
  ): Encounter {
    if (!Number.isSafeInteger(partyLevel) || partyLevel < 1) {
      throw new RangeError("Party level must be a positive whole number.");
    }
    if (!Number.isSafeInteger(partySize) || partySize < 1) {
      throw new RangeError("Party size must be a positive whole number.");
    }

    const monsters = MonsterLoader.loadMonsters() as Monster[];
    if (!Array.isArray(monsters) || monsters.length === 0) {
      throw new Error("Cannot generate an encounter: the monster catalogue is empty.");
    }

    let count = partySize >= 4 ? 2 : 1;
    if (difficulty === "hard") count += 1;
    if (difficulty === "deadly") count += 2;

    // Challenge is used as a conservative eligibility ceiling, not as a full
    // XP-budget encounter calculator. A future approved balance model can replace it.
    const eligible = monsters.filter(monster =>
      typeof monster.challenge === "number" &&
      Number.isFinite(monster.challenge) &&
      monster.challenge <= partyLevel
    );
    const pool = eligible.length > 0
      ? [...eligible]
      : [monsters.reduce((lowest, monster) =>
          monster.challenge < lowest.challenge ? monster : lowest
        )];

    const selected: Monster[] = [];
    while (selected.length < count && pool.length > 0) {
      const index = Math.floor(Math.random() * pool.length);
      const [monster] = pool.splice(index, 1);
      selected.push({ ...monster });
    }

    // Only repeat a monster if the eligible catalogue is smaller than the encounter.
    while (selected.length < count) {
      const monster = eligible.length > 0
        ? eligible[Math.floor(Math.random() * eligible.length)]
        : selected[0];
      selected.push({ ...monster });
    }

    return { difficulty, monsters: selected };
  }
}