import { CharacterBuilder } from "../engine/characters/characterBuilder";
import { GameSession } from "../engine/game/gameSession";

const hero =
  CharacterBuilder.create(
    "Aric",
    "elf",
    "scholar",
    "wizard",
    "shadowveil"
  );

const game = new GameSession();

console.log(
  game.start(hero)
);
