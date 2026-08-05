import { Command } from "./command";
import { EncounterDirector } from "../../ai/encounterDirector";
import { narrateEncounter } from "../../../src/ai/encounterNarrator";

export class EncounterCommand implements Command {

  name = "encounter";

  constructor(
    private encounterDirector: EncounterDirector,
    private combat: any,
    private state: any
  ) {}

  async execute(): Promise<string> {

    if (this.state.character.hitPoints <= 0) {

      this.state.character.hitPoints = 10;

    }

    const encounter =
      this.encounterDirector.createEncounter({
        location: "Ashenvale",
        partyLevel: 1,
        partySize: 1,
        danger: "dangerous"
      });

    this.combat.start(
      encounter.monsters
    );

    const story = await narrateEncounter(
      "Ashenvale",
      this.state.character,
      encounter
    );

    return `
${story}

⚔️ Combat Begins!

Enemies:

${this.combat.state.enemies
  .map(
    (monster: any) =>
      `${monster.name} (${monster.hitPoints} HP)`
  )
  .join("\n")}
`;
  }

}
