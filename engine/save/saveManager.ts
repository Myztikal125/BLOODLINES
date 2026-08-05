import * as fs from "fs";

export interface SaveData {

  character: any;

  progress: {
    level: number;
    experience: number;
    gold: number;
  };


  world: {

    currentLocation: string;

    discoveredLocations: string[];

    activeQuests: string[];

    discoveredNPCs: string[];

    events: string[];

  };


  inventory: {

    items: {

      name: string;

      quantity: number;

    }[];

  };

}


export class SaveManager {

  constructor(
    private filename = "savegame.json"
  ) {}


  save(data: SaveData): void {

    fs.writeFileSync(
      this.filename,
      JSON.stringify(data, null, 2),
      "utf8"
    );

  }


  load(): SaveData | null {

    if (!fs.existsSync(this.filename)) {

      return null;

    }


    return JSON.parse(
      fs.readFileSync(
        this.filename,
        "utf8"
      )
    );

  }

}
