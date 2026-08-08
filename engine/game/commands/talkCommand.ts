import { Command } from "./command";
import { NPCDialogueService } from "../../../src/npcs/npcDialogueService";
import { NPCLoader } from "../../world/npcs/npcLoader";

export class TalkCommand implements Command {

  name = "talk";

  constructor(
    private dialogue: NPCDialogueService
  ) {}

  execute(args?: string[]): string {

    if (!args || args.length === 0) {
      return "Talk to who?";
    }

    const input = args.join(" ").toLowerCase();

    // Fuzzy match NPC by name or id
    const allNPCs = NPCLoader.loadNPCs();
    const match = allNPCs.find((n: any) =>
      n.id.toLowerCase().includes(input) ||
      n.name.toLowerCase().includes(input) ||
      input.includes(n.name.split(" ")[0].toLowerCase())
    );

    if (!match) {
      return `Unknown NPC: "${args.join(" ")}". Try exploring to find someone nearby.`;
    }

    const result = this.dialogue.talk(match.id, "shadow");

    if (typeof result === "string") {
      return result;
    }

    return `
${result.npc}

${result.dialogue}
`;
  }
}
