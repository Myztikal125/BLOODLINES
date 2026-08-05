# Architecture

## Overview
BLOODLINES is a modular TypeScript RPG engine combining D&D inspired rules with custom Bloodlines mechanics.

## Structure

src/
- engine/ - Core game logic
- rules/ - Ruleset implementations
- data/ - Game content
- systems/ - Gameplay systems
- index.ts - Application entry point

## Rules
Supports:
- D&D 2014 concepts
- D&D 2024 concepts
- Custom Bloodlines rules

## Design Goal
Keep systems modular so rules, classes, races, enemies, and world content can expand independently.
