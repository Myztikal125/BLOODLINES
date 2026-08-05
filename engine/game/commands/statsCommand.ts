import { Command } from "./command";
import { PlayerProgress } from "../../progression/playerProgress";

export class StatsCommand implements Command {

  name = "stats";

  constructor(
    private progress: PlayerProgress
  ) {}

  execute(): string {

    return `
=== PROGRESSION ===

Level:
${this.progress.level}

Experience:
${this.progress.experience}

Gold:
${this.progress.gold}
`;

  }

}
