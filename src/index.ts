import { GameRunner } from "../engine/game/gameRunner";
import { TerminalInterface } from "./interface/terminal";
import { GameController } from "../engine/game/gameController";
import { CombatController } from "../engine/combat/combatController";

const runner = new GameRunner();

const player = runner.start({
  name: "Shadow",
  ancestry: "elf",
  background: "scholar",
  className: "wizard",
  bloodline: "shadowveil"
});

const state = {
  character: player.data,
  location: "Ashenvale",
  inventory: []
};

const combat = new CombatController();

const controller =
  new GameController(state, combat);

const terminal =
  new TerminalInterface();

terminal.start(input => {
  controller.handle(input);
});
