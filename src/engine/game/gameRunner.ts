import { createCharacter } from "../characterFactory";

export class GameRunner {

  start(data: {
    name: string;
    ancestry: string;
    background: string;
    className: string;
    bloodline: string;
  }) {

    const character = createCharacter({
      name: data.name,
      classId: data.className,
      level: 1,
      bloodlineIds: [
        data.bloodline
      ]
    });

    return {
      data: character
    };
  }
}
