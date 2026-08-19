export type FormulaContext = Record<string, number>;
export type Formula = (context: FormulaContext) => number;

export interface DerivedRule {
  id: string;
  dependsOn: string[];
  evaluate: Formula;
}

/**
 * Evaluates derived rules in dependency order and rejects circular graphs.
 * Rule evaluation remains deterministic and independent of the AI layer.
 */
export function evaluateDerivedRules(
  base: FormulaContext,
  rules: DerivedRule[],
): FormulaContext {
  const byId = new Map(rules.map(rule => [rule.id, rule]));
  const result = { ...base };
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const evaluate = (id: string): void => {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new Error(`Circular derived-stat dependency: ${id}`);
    const rule = byId.get(id);
    if (!rule) throw new Error(`Unknown derived-stat dependency: ${id}`);

    visiting.add(id);
    for (const dependency of rule.dependsOn) {
      if (byId.has(dependency)) evaluate(dependency);
    }
    result[id] = rule.evaluate(result);
    visiting.delete(id);
    visited.add(id);
  };

  for (const rule of rules) evaluate(rule.id);
  return result;
}
