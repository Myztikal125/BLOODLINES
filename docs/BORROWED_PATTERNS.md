# Borrowed Architecture Patterns

This document records patterns adapted into BLOODLINES from public RPG/agent projects. BLOODLINES keeps its own TypeScript domain model and rules; these are architectural adaptations, not wholesale copies.

## LoreKit

Source: `matluz1/lorekit`

Adapted ideas:
- Keep mechanical crunch deterministic and outside the AI narration layer.
- Represent modifiers explicitly so stacking/order is deterministic.
- Derive computed stats from a small rules layer rather than asking the model to calculate them.

BLOODLINES implementation: `src/engine/rules/modifierEngine.ts`.

## RPG DM Bot

Source: `mojomast/rpg-dm-bot`

Adapted ideas:
- Centralize LLM tool definitions.
- Keep tool schemas and executable handlers tied to one contract.
- Reject tools that are not registered and validate required arguments before execution.

BLOODLINES implementation: `src/ai/toolContracts.ts`.

## Gradient Bang

Source: `pipecat-ai/gradient-bang`

Adapted idea:
- Use a small event relay to decouple state-changing systems from consumers such as AI, narrative, logging, and UI.

BLOODLINES implementation: `src/engine/events/eventBus.ts`.

## Scope rule

No Utopia Nexus code or Nexus-specific architecture is included in this work. Existing BLOODLINES rules, data, and APIs remain authoritative; the borrowed layers are intentionally generic and additive.
