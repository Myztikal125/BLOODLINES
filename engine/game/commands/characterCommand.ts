import { Command } from "./command";
import { GameState } from "../gameState";

export class CharacterCommand implements Command {

  name = "character";

  constructor(
    private state: GameState
  ) {}

  execute(): string {
    const c = this.state.character;
    const ab = c.abilities || {};
    const cls = c.class || {};

    const features = (cls.features || []).map((f: any) => {
      const lvl = f.level ? `[Lv${f.level}] ` : "";
      return `  ${lvl}${f.name}`;
    }).join("\n") || "  None";

    return `
╔══════════════════════════╗
  ${c.name}
  ${c.ancestry} ${c.className} | ${c.bloodline}
  Level ${c.level}
╚══════════════════════════╝

HP: ${c.hitPoints}
AC: ${c.armorClass}

ABILITIES
  STR: ${ab.strength ?? 10}
  DEX: ${ab.dexterity ?? 10}
  CON: ${ab.constitution ?? 10}
  INT: ${ab.intelligence ?? 10}
  WIS: ${ab.wisdom ?? 10}
  CHA: ${ab.charisma ?? 10}

CLASS FEATURES
${features}

BLOODLINE BONUS
  ${cls.bloodlineBonus || "None"}
`;
  }
}
