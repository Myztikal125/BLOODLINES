import { SpellLoader } from "./spellLoader";

export class SpellExecutor {

  cast(
    spellId: string,
    caster: any,
    target: any
  ) {

    const spell =
      SpellLoader.getSpell(spellId);

    if (!spell) {

      return {
        success: false,
        message: "Unknown spell."
      };

    }

    if (spell.damage) {

      const damage =
        Math.floor(
          Math.random() * 8
        ) + 1;

      target.hitPoints -= damage;

      return {
        success: true,
        message:
          `${caster.name} casts ${spell.name} for ${damage} damage.`
      };

    }

    return {
      success: true,
      message:
        `${caster.name} casts ${spell.name}.`
    };

  }

}
