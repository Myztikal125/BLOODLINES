import { CommandManager } from "./commands/commandManager";
import { HelpCommand } from "./commands/helpCommand";
import { CharacterCommand } from "./commands/characterCommand";
import { ExploreCommand } from "./commands/exploreCommand";
import { CombatController } from "../combat/combatController";
import { CombatCommand } from "./commands/combatCommand";
import { WorldCommand } from "./commands/worldCommand";
import { QuestCommand } from "./commands/questCommand";
import { GameState } from "./gameState";
import { WorldState } from "../world/state/worldState";
import { QuestManager } from "../world/quests/questManager";

export class GameController {

  private commands = new CommandManager();

  private world =
    new WorldState();

  private quests =
    new QuestManager();

  constructor(
    private state: GameState,
    private combat: CombatController
  ) {

    this.commands.register(
      new HelpCommand()
    );

    this.commands.register(
      new CharacterCommand(this.state)
    );

    this.commands.register(
      new ExploreCommand(
        this.state,
        this.world, this.quests
      )
    );

    this.commands.register(
      new CombatCommand(this.combat)
    );

    this.commands.register(
      new WorldCommand(this.world)
    );

    this.commands.register(
      new QuestCommand(this.quests)
    );

  }

  handle(input: string) {

    console.log(
      this.commands.execute(input)
    );

  }

}
