import { Command } from "./command";
import { GameState } from "../gameState";

export class ExploreCommand implements Command {

  name = "explore";

  constructor(
    private state: GameState
  ) {}

  execute(): string {

    return `
You explore ${this.state.location}.

The wind carries distant voices.
Something watches from the shadows...
`;

  }

}
