import { Command } from "./command";
import { NPCDialogueService } from "../../../src/npcs/npcDialogueService";

export class TalkCommand implements Command {

  name = "talk";

  constructor(
    private dialogue: NPCDialogueService
  ) {}

  execute(args?: string[]): string {

    const npcId = args?.[0];

    if (!npcId) {
      return "Talk to who?";
    }

    const result =
      this.dialogue.talk(
        npcId,
        "shadow"
      );

    if (typeof result === "string") {
      return result;
    }

    return `
${result.npc}

${result.dialogue}
`;
  }

}
