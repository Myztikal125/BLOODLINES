import { Dice } from "../core/dice";
import { SpellLoader } from "./spellLoader";

function rollExpression(expression: string): number {
  const match = expression.match(/^\s*(\d*)d(\d+)\s*([+-]\s*\d+)?(?:\s+.*)?$/i);
  if (!match) {
    throw new Error(`Unsupported dice expression: ${expression}`);
  }

  const count = match[1] ? Number(match[1]) : 1;
  const sides = Number(match[2]);
  const modifier = match[3] ? Number(match[3].replace(/\s/g, "")) : 0;

  if (!Number.isSafeInteger(count) || count < 1 || count > 100 ||
      !Number.isSafeInteger(sides) || sides < 1 || sides > 1000 ||
      !Number.isSafeInteger(modifier)) {
    throw new Error(`Invalid dice expression: ${expression}`);
  }

  let total = modifier;
  for (let die = 0; die < count; die++) total += Dice.roll(sides);
  return Math.max(0, total);
}

export class SpellExecutor {
  cast(spellId: string, caster: any, target: any) {
    const spell = SpellLoader.getSpell(spellId);

    if (!spell) {
      return { success: false, message: "Unknown spell." };
    }

    if (spell.damage) {
      const hpField = typeof target?.currentHitPoints === "number"
        ? "currentHitPoints"
        : "hitPoints";
      if (!target || typeof target[hpField] !== "number") {
        return { success: false, message: "This target has no supported hit point field." };
      }

      let damage: number;
      try {
        damage = rollExpression(spell.damage);
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Invalid spell damage expression."
        };
      }

      target[hpField] = Math.max(0, target[hpField] - damage);
      return {
        success: true,
        message: `${caster?.name ?? "The caster"} casts ${spell.name} for ${damage} damage.`,
        damage,
        defeated: target[hpField] === 0
      };
    }

    if (spell.healing) {
      const hpField = typeof target?.currentHitPoints === "number"
        ? "currentHitPoints"
        : "hitPoints";
      if (!target || typeof target[hpField] !== "number") {
        return { success: false, message: "This target has no supported hit point field." };
      }

      let healing: number;
      try {
        healing = rollExpression(spell.healing);
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Invalid spell healing expression."
        };
      }

      const before = target[hpField];
      const maximum = typeof target.maxHitPoints === "number"
        ? target.maxHitPoints
        : typeof target.maximumHitPoints === "number"
          ? target.maximumHitPoints
          : undefined;
      target[hpField] = Math.max(0, maximum === undefined
        ? before + healing
        : Math.min(maximum, before + healing));
      const actualHealing = target[hpField] - before;
      return {
        success: true,
        message: `${caster?.name ?? "The caster"} casts ${spell.name}, restoring ${actualHealing} hit points.`,
        healing: actualHealing
      };
    }

    return {
      success: true,
      message: `${caster?.name ?? "The caster"} casts ${spell.name}.`
    };
  }
}