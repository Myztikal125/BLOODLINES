# BLOODLINES Project State

## Current Direction

BLOODLINES is being developed as an AI-assisted tabletop RPG system.

## Architecture Plan

### Research Layer
AI research assistants gather and organize:
- RPG rules research
- Character systems
- Magic systems
- Monster design
- World building
- AI Dungeon Master concepts

Stored in:
- research/

### Game Data Layer
Approved designs become:
- classes
- spells
- monsters
- items
- locations
- bloodlines

Stored in:
- data/

### Campaign System
Stores:
- characters
- quests
- NPC relationships
- world changes
- campaign memories

### AI Dungeon Master
Uses OpenRouter and retrieves:
- rules
- world information
- character history
- campaign memories

## Current Engine Status

- TypeScript engine running
- Character creation working
- Combat loop working
- Encounter generation working
- AI narration foundation working

## Next Major Systems

1. Research assistant workflow
2. Knowledge base
3. Campaign memory system
4. AI Dungeon Master
5. Expanded rules/content
