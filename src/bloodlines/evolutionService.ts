import { loadBloodline } from "./bloodlineLoader";

export function getAvailableEvolutions(
  bloodlineId: string,
  level: number,
  evolutionPoints: number
) {
  const bloodline = loadBloodline(bloodlineId);

  return bloodline.evolutions.filter(
    (evolution: any) =>
      level >= evolution.unlock.level &&
      evolutionPoints >= 1
  );
}
