import { NPCService } from "../npcs/npcService";
import { PersonalityService } from "../npcs/personality/personalityService";
import { RelationshipService } from "../npcs/relationships/relationshipService";
import { RelationshipGenerator } from "../npcs/relationships/relationshipGenerator";

export class WorldInitializer {

  constructor(
    private npcService: NPCService,
    private personalityService: PersonalityService,
    private relationshipService: RelationshipService
  ) {}

  initialize(
    worldData: any,
    npcData: any[]
  ) {

    console.log("Initializing world...");

    if (worldData) {
      console.log(
        `Loaded world: ${worldData.name ?? "Unknown"}`
      );
    }

    this.loadNPCs(npcData);

    console.log("Building relationships...");

    const generator =
      new RelationshipGenerator(
        this.relationshipService,
        this.npcService
      );

    for (const npc of npcData) {
      generator.processNPCRelationships(npc);
    }

    console.log(
      "World initialization complete."
    );
  }


  private loadNPCs(
    npcData: any[]
  ) {

    const npcs = npcData.map(npc => ({
      id: npc.id,
      name: npc.name,

      role:
        npc.identity?.role ??
        npc.role,

      location:
        npc.identity?.location ??
        npc.location,

      faction:
        npc.identity?.faction ??
        npc.faction,

      description:
        npc.description ?? "",

      trust:
        npc.stateVariables?.trust ??
        npc.trust ??
        0,

      quests:
        npc.questHooks ??
        npc.quests ??
        []
    }));

    this.npcService.load(npcs);
  }
}
