import { CombinationUnlock } from "./types";

export interface CombinationPreview {
  id: string;
  name: string;
  summary: string;
  unlocked: boolean;
  available: boolean;
  requirements: string[];
  unlocks: string[];
}

export function buildCombinationPreview(
  combination: CombinationUnlock,
  state: { unlocked: string[]; available: string[] }
): CombinationPreview {
  return {
    id: combination.id,
    name: combination.name,
    summary: combination.summary,
    unlocked: state.unlocked.includes(combination.id),
    available: state.available.includes(combination.id),
    requirements: [
      ...(combination.requirements.classes?.map(value => `Class: ${value}`) ?? []),
      ...(combination.requirements.bloodlines?.map(value => `Bloodline: ${value}`) ?? []),
      `Tags: ${combination.requirements.tags.join(", ")}`,
      ...(combination.requirements.minLevel ? [`Level ${combination.requirements.minLevel}+`] : []),
      ...(combination.requirements.requires?.map(value => `Requires: ${value}`) ?? [])
    ],
    unlocks: combination.unlocks
  };
}
