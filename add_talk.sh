#!/bin/bash

FILE="engine/game/gameController.ts"

sed -i '/import { RemoveItemCommand } from ".\/commands\/removeItemCommand";/a\
import { TalkCommand } from "./commands/talkCommand";\
import { NPCService } from "../../npcs/npcService";\
import { NPCMemoryService } from "../../npcs/npcMemory";\
import { RelationshipService } from "../../npcs/relationships/relationshipService";\
import { NPCDialogueService } from "../../npcs/npcDialogueService";' "$FILE"

sed -i '/new RemoveItemCommand(this.inventory)/a\
\
    this.commands.register(\
      new TalkCommand(\
        new NPCDialogueService(\
          new NPCService(),\
          new NPCMemoryService(),\
          new RelationshipService()\
        )\
      )\
    );' "$FILE"
