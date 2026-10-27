import { Command } from "./command";
import { SpellExecutor } from "../../spells/spellExecutor";

export class CastCommand implements Command {
  name = "cast";
  private executor = new SpellExecutor();

  constructor(
    private caster: any,
    private target: any | ((targetName?: string) => any)
  ) {}

  execute(args?: string[]): string {
    const spell = args?.[0];
    if (!spell) return "Cast what?";

    const targetName = args?.slice(1).join(" ").trim();
    const target = typeof this.target === "function"
      ? this.target(targetName || undefined)
      : this.target;

    return this.executor.cast(spell, this.caster, target).message;
  }
}