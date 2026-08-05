# BLOODLINES AI Configuration

## AI Provider
OpenRouter

## Assistant Roles

### Researcher
Purpose:
- Gather RPG knowledge
- Organize research
- Create summaries

Access:
- research/
- docs/

Can:
- Create research notes
- Compare systems
- Suggest mechanics

Cannot:
- Directly modify engine code

---

### Rules Engine Assistant

Purpose:
- Convert approved rules into game logic

Access:
- engine/
- src/
- research/

Can:
- Suggest code changes
- Create tests

Requires:
- Research approval

---

### Dungeon Master Assistant

Purpose:
- Run adventures

Access:
- world state
- quests
- characters
- rules

Can:
- Generate narrative
- Create encounters
- Manage NPC behavior

---

### Scribe Assistant

Purpose:
- Maintain project memory

Updates:
- docs/
- CHANGELOG.md
- SESSION_CHECKPOINT.md
