import { askAI } from "./aiClient";
import fs from "fs";

export async function generateRules(target: string) {
  const rulesBible = fs.readFileSync("docs/RULES_BIBLE.md", "utf8");

  const prompt = `
You are the BLOODLINES Rules Engine Assistant.

ROLE:
- Translate already-approved Rules Bible requirements into engine-facing specifications and data structures.
- Inspect the supplied repository context before identifying missing implementation pieces.
- Report implementation gaps and neutral technical structures without deciding unspecified gameplay.

HARD BOUNDARIES:
- docs/RULES_BIBLE.md is authoritative.
- Do not invent gameplay mechanics, numeric values, costs, triggers, timing, frequencies, abilities, defaults, regeneration, caps, or balancing.
- Do not convert unresolved questions into implementation requirements.
- Do not reopen rules marked APPROVED/DEFINED.
- Do not silently approve or reject design decisions.
- Existing code is evidence of implementation state, not gameplay authority.
- This assistant does not modify runtime code; it produces a specification for the appropriate implementation workflow.

TARGET SYSTEM:
${target}

RULES BIBLE:
${rulesBible}

Return exactly:

# Implementation Status

# Approved Requirements

# Repository Findings

# Unresolved Implementation Details

# Data Structure

# Required Files

# Engine Changes

# Test Requirements

# Implementation Notes

In Implementation Notes, explicitly separate authorized behavior from neutral engineering choices. If a gameplay value or behavior is unspecified, say that it remains unspecified rather than choosing one.
`;

  return await askAI(prompt, "You are the BLOODLINES Rules Engine Assistant. Follow the shared governance protocol and remain within the Rules Engine role.");
}
