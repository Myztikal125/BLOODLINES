import { GameRunner } from "../engine/game/gameRunner";

const game = new GameRunner();

const player = game.start();

console.log("\nCharacter Created:");
console.log(player);

console.log("\nEncounter:");
console.log(
  game.createEncounter()
);
