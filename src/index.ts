import { GameRunner } from "../engine/game/gameRunner";

const game = new GameRunner();

const player = game.start({

  name: "Shadow",

  ancestry: "elf",

  background: "scholar",

  className: "wizard",

  bloodline: "shadowveil"

});

console.log("\n=== CHARACTER ===");
console.log(player);

console.log("\n=== ENCOUNTER ===");
console.log(
  game.createEncounter()
);
