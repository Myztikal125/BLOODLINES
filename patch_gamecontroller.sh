#!/bin/bash

FILE="engine/game/gameController.ts"

sed -i '/import { InventoryCommand } from ".\/commands\/inventoryCommand";/a\
import { TalkCommand } from "./commands/talkCommand";\
import { NPCService } from "../../../src/npcs/npcService";\
import { NPCMemoryService } from "../../../src/npcs/npcMemory";\
import { RelationshipService } from "../../../src/npcs/relationships/relationshipService";\
import { NPCDialogueService } from "../../../src/npcs/npcDialogueService";' "$FILE"

sed -i '/    this.commands.register(/,$!b' "$FILE"

