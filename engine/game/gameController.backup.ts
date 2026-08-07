import { CommandManager } from "./commands/commandManager";
import { HelpCommand } from "./commands/helpCommand";
import { CharacterCommand } from "./commands/characterCommand";
import { ExploreCommand } from "./commands/exploreCommand";
import { InvestigateCommand } from "./commands/investigateCommand";
import { CombatController } from "../combat/combatController";
import { CombatCommand } from "./commands/combatCommand";
import { EncounterCommand } from "./commands/encounterCommand";
import { EncounterDirector } from "../ai/encounterDirector";
import { WorldCommand } from "./commands/worldCommand";
import { QuestCommand } from "./commands/questCommand";
import { StatsCommand } from "./commands/statsCommand";
import { CompleteQuestCommand } from "./commands/completeQuestCommand";
import { ObjectiveCommand } from "./commands/objectiveCommand";
import { GameState } from "./gameState";
import { WorldState } from "../world/state/worldState";
import { QuestManager } from "../world/quests/questManager";
import { PlayerProgress } from "../progression/playerProgress";
import { RewardHandler } from "../progression/rewardHandler";
import { SaveManager } from "../save/saveManager";
import { SaveCommand } from "./commands/saveCommand";
import { LoadCommand } from "./commands/loadCommand";
import { Inventory } from "../inventory/inventory";
import { InventoryCommand } from "./commands/inventoryCommand";
import { AddItemCommand } from "./commands/addItemCommand";
import { RemoveItemCommand } from "./commands/removeItemCommand";
import { narrateEvent } from "../../src/ai/gameNarrator";

export class GameController {

  private commands = new CommandManager();

  private encounters = new EncounterDirector();

  private world =
    new WorldState();

  private quests =
    new QuestManager();

  private progress =
    new PlayerProgress();

  private rewards =
    new RewardHandler(this.progress);

  private saves =
    new SaveManager();

  private inventory =
    new Inventory();

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
        this.world,
        this.quests
      )
    );

    this.commands.register(
      new InvestigateCommand(
        this.world,
        this.quests
      )
    );

    this.commands.register(
      new CombatCommand(
        this.combat,
        this.state
      )
    );

    this.commands.register(
      new EncounterCommand(
        this.encounters,
        this.combat,
        this.state
      )
    );

    this.commands.register(
      new WorldCommand(this.world)
    );

    this.commands.register(
      new QuestCommand(this.quests)
    );

    this.commands.register(
      new StatsCommand(this.progress)
    );

    this.commands.register(
      new CompleteQuestCommand(
        this.quests,
        this.rewards
      )
    );

    this.commands.register(
      new ObjectiveCommand(
        this.quests,
        this.rewards
      )
    );

    this.commands.register(
      new SaveCommand(
        this.saves,
        this.progress,
        this.world,
        this.state,
        this.inventory
      )
    );

    this.commands.register(
      new InventoryCommand(this.inventory)
    );

    this.commands.register(
      new AddItemCommand(this.inventory)
    );

    this.commands.register(
      new RemoveItemCommand(this.inventory)
    );

    this.commands.register(
      new LoadCommand(
        this.saves,
        this.progress,
        this.world,
        this.state,
        this.inventory
      )
    );

  }

  async handle(input: string) {

    const result = await this.commands.execute(input);

    console.log(result);

    if (
      input === "explore" ||
      input === "combat"
    ) {
      const story = await narrateEvent(
        result,
        this.state.character,
        this.state.location
      );

      console.log("\n" + story);
    }

  }

}
