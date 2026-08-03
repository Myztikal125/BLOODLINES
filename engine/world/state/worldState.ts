export class WorldState {

  currentLocation: string;

  discoveredLocations: string[];

  activeQuests: string[];

  discoveredNPCs: string[];

  events: string[];

  constructor() {

    this.currentLocation = "Ashenvale";

    this.discoveredLocations = [
      "Ashenvale"
    ];

    this.activeQuests = [];

    this.discoveredNPCs = [];

    this.events = [];

  }


  discoverLocation(location: string) {

    if (
      !this.discoveredLocations.includes(location)
    ) {

      this.discoveredLocations.push(location);

    }

  }


  addQuest(quest: string) {

    this.activeQuests.push(quest);

  }


  recordEvent(event: string) {

    this.events.push(event);

  }

}
