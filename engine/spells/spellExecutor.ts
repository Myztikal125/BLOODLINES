import { Dice } from "../core/dice";
import { modifier } from "../core/attributes";
import { Spell, SpellSaveAbility } from "./spell";
import { SpellLoader } from "./spellLoader";
import { SpellCaster } from "./spellCaster";

function parseExpression(expression: string, critical = false): { count: number; sides: number; modifier: number } {
  const match = expression.match(/^\s*(\d*)d(\d+)\s*([+-]\s*\d+)?(?:\s+.*)?$/i);
  if (!match) throw new Error(`Unsupported dice expression: ${expression}`);

  const count = match[1] ? Number(match[1]) : 1;
  const sides = Number(match[2]);
  const fixedModifier = match[3] ? Number(match[3].replace(/\s/g, "")) : 0;
  if (!Number.isSafeInteger(count) || count < 1 || count > 100 ||
      !Number.isSafeInteger(sides) || sides < 1 || sides > 1000 ||
      !Number.isSafeInteger(fixedModifier)) {
    throw new Error(`Invalid dice expression: ${expression}`);
  }
  return { count: critical ? count * 2 : count, sides, modifier: fixedModifier };
}

function rollExpression(expression: string, critical = false): number {
  const parsed = parseExpression(expression, critical);
  let total = parsed.modifier;
  for (let die = 0; die < parsed.count; die++) total += Dice.roll(parsed.sides);
  return Math.max(0, total);
}

function characterData(character: any): any {
  return character?.data ?? character;
}

function spellcastingStats(caster: any): { modifier: number; proficiency: number } | undefined {
  const data = characterData(caster);
  const ability = data?.class?.primaryAbility;
  const abilities = data?.abilities;
  const score = typeof ability === "string" ? abilities?.[ability] : undefined;
  const level = data?.level;
  if (!Number.isFinite(score) || !Number.isInteger(level) || level < 1 || level > 20) return undefined;

  const proficiency = level <= 4 ? 2 : level <= 8 ? 3 : level <= 12 ? 4 : level <= 16 ? 5 : 6;
  return { modifier: modifier(score), proficiency };
}

function targetHitPointField(target: any): "currentHitPoints" | "hitPoints" | undefined {
  if (typeof target?.currentHitPoints === "number") return "currentHitPoints";
  if (typeof target?.hitPoints === "number") return "hitPoints";
  return undefined;
}

export class SpellExecutor {
  private spellCaster = new SpellCaster();

  restoreSlots(): void {
    this.spellCaster.restoreSlots();
  }

  cast(spellId: string, caster: any, target: any) {
    const spell: Spell | undefined = SpellLoader.getSpell(spellId);

    if (!spell) return { success: false, message: "Unknown spell." };
    if (!this.spellCaster.canCast(spell)) return { success: false, message: "No spell slot available." };

    if (spell.resolution === "utility") {
      return {
        success: false,
        message: `${spell.name} is listed, but its effect is not implemented yet; no spell slot was spent.`
      };
    }

    if (spell.resolution === "attack" || spell.resolution === "save" || spell.resolution === "automatic") {
      if (!target || !targetHitPointField(target)) {
        return { success: false, message: "This target has no supported hit point field." };
      }
      if (!spell.damage) return { success: false, message: "Spell damage is not defined; no spell slot was spent." };
      try {
        parseExpression(spell.damage);
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Invalid spell damage expression." };
      }
    }

    if (spell.resolution === "healing") {
      if (!spellcastingStats(caster)) {
        return { success: false, message: "Caster needs a valid spellcasting ability and level (1–20); no spell slot was spent." };
      }
      if (!target || !targetHitPointField(target)) {
        return { success: false, message: "This target has no supported hit point field." };
      }
      if (!spell.healing) return { success: false, message: "Spell healing is not defined; no spell slot was spent." };
      try {
        parseExpression(spell.healing);
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Invalid spell healing expression." };
      }
    }

    let attackRoll: number | undefined;
    let attackBonus: number | undefined;
    let critical = false;
    let saveRoll: number | undefined;
    let saveDC: number | undefined;
    let saveSucceeded = false;

    if (spell.resolution === "attack") {
      const stats = spellcastingStats(caster);
      if (!stats) return { success: false, message: "Caster needs a valid spellcasting ability and level (1–20); no spell slot was spent." };
      if (!Number.isFinite(target.armorClass)) return { success: false, message: "This target has no valid Armor Class." };
      attackRoll = Dice.d20();
      attackBonus = stats.modifier + stats.proficiency;
      const total = attackRoll + attackBonus;
      if (attackRoll === 1 || (attackRoll !== 20 && total < target.armorClass)) {
        this.spellCaster.cast(spell);
        return {
          success: false,
          hit: false,
          roll: attackRoll,
          total,
          attackBonus,
          message: `${caster?.name ?? "The caster"} casts ${spell.name}, but the spell misses (roll ${attackRoll} + ${attackBonus} = ${total} vs AC ${target.armorClass}).`
        };
      }
      critical = attackRoll === 20;
    }

    if (spell.resolution === "save") {
      const stats = spellcastingStats(caster);
      const ability = spell.saveAbility as SpellSaveAbility | undefined;
      const savingThrows = target?.savingThrows;
      const targetSaveModifier = ability ? savingThrows?.[ability] : undefined;
      if (!stats) return { success: false, message: "Caster needs a valid spellcasting ability and level (1–20); no spell slot was spent." };
      if (!ability || !Number.isFinite(targetSaveModifier)) {
        return { success: false, message: "Target needs an explicit modifier for this spell's saving throw; no spell slot was spent." };
      }
      saveDC = 8 + stats.modifier + stats.proficiency;
      saveRoll = Dice.d20();
      saveSucceeded = saveRoll + targetSaveModifier >= saveDC;
    }

    if (spell.resolution === "attack" || spell.resolution === "save" || spell.resolution === "automatic") {
      const hpField = targetHitPointField(target)!;
      let damage = rollExpression(spell.damage!, critical);
      if (spell.resolution === "save" && saveSucceeded) {
        damage = spell.saveSuccess === "half" ? Math.floor(damage / 2) : 0;
      }
      // A valid attempt spends its slot on hit, miss, or a successful target save.
      this.spellCaster.cast(spell);
      target[hpField] = Math.max(0, target[hpField] - damage);
      const hit = spell.resolution === "automatic" || spell.resolution === "save" || critical || (attackRoll !== undefined && attackRoll !== 1);
      let message: string;
      if (spell.resolution === "save") {
        message = saveSucceeded
          ? `${caster?.name ?? "The caster"} casts ${spell.name}; the target succeeds on its saving throw (${saveRoll} + ${target.savingThrows[spell.saveAbility!]} vs DC ${saveDC}) and takes ${damage} damage.`
          : `${caster?.name ?? "The caster"} casts ${spell.name}; the target fails its saving throw and takes ${damage} damage.`;
      } else {
        message = `${caster?.name ?? "The caster"} casts ${spell.name} for ${damage} damage.`;
      }
      return {
        success: true, hit, damage, critical,
        ...(attackRoll === undefined ? {} : { roll: attackRoll, attackBonus, total: attackRoll + attackBonus! }),
        ...(saveRoll === undefined ? {} : { saveRoll, saveDC, saveSucceeded }),
        message,
        defeated: target[hpField] === 0
      };
    }

    if (spell.resolution === "healing") {
      const hpField = targetHitPointField(target)!;
      const healingStats = spellcastingStats(caster)!;
      const healing = Math.max(0, rollExpression(spell.healing!) + healingStats.modifier);
      const before = target[hpField];
      const maximum = typeof target.maxHitPoints === "number"
        ? target.maxHitPoints
        : typeof target.maximumHitPoints === "number"
          ? target.maximumHitPoints
          : undefined;
      this.spellCaster.cast(spell);
      target[hpField] = Math.max(0, maximum === undefined
        ? before + healing
        : Math.min(maximum, before + healing));
      const actualHealing = target[hpField] - before;
      return {
        success: true,
        healing: actualHealing,
        message: `${caster?.name ?? "The caster"} casts ${spell.name}, restoring ${actualHealing} hit points.`
      };
    }

    return { success: false, message: "Unsupported spell resolution; no spell slot was spent." };
  }
}
