import { Command } from "./command";
import { SpellExecutor } from "../../spells/spellExecutor";

export class CastCommand implements Command {

  name = "cast";

  private executor =
    new SpellExecutor();

  constructor(
    private caster: any,
    private target: any
  ) {}

  execute(args?: string[]): string {

    const spell =
      args?.[0];

    if (!spell) {

      return "Cast what?";

    }

    return this.executor
      .cast(
        spell,
        this.caster,
        this.target
      )
      .message;

  }

}
