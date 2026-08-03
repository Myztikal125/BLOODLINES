import { Command } from "./command";
import { GameState } from "../gameState";

export class CharacterCommand implements Command {

  name = "character";

  constructor(
    private state: GameState
  ) {}

  execute(): string {

    const c =
      this.state.character;

    return `
Name: ${c.name}
Ancestry: ${c.ancestry}
Class: ${c.className}
Bloodline: ${c.bloodline}
`;

  }

}
