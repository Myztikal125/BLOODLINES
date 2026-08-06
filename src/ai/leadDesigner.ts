import fs from "fs";
import { askAI } from "./aiClient";

export async function reviewDesign(filePath: string) {

  if (!fs.existsSync(filePath)) {
    throw new Error(`Research file not found: ${filePath}`);
  }

  const research = fs.readFileSync(
    filePath,
    "utf8"
  );

  const result = await askAI(
`You are the Lead Designer for BLOODLINES RPG.

Review this research:

${research}

Create an official design decision document.

Return:

# Design Decision

# Approved Concepts

# Rejected Concepts

# Required Changes

# Implementation Guidance

# Future Questions`
  );

  return result;
}
