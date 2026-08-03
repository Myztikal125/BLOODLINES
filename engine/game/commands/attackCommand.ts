import { Command } from "./command";
import { EncounterDirector } from "../../ai/encounterDirector";

export class AttackCommand implements Command {

  name = "attack";

  constructor(
    private encounterDirector:
      EncounterDirector
  ) {}

  execute(): string {

    const encounter =
      this.encounterDirector.createEncounter({
        location: "Ashenvale",
        partyLevel: 1,
        partySize: 1,
        danger: "dangerous"
      });

    return `
⚔️ Combat Begins!

Enemies:

${encounter.monsters
  .map(
    (monster: any) =>
      `${monster.name} (${monster.hitPoints} HP)`
  )
  .join("\n")}
`;

  }

}
